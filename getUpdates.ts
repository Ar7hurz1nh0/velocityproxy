import "https://deno.land/x/dotenv@v3.2.0/load.ts"
import { Octokit } from "https://cdn.skypack.dev/octokit?dts";
import { download, Destination, DownlodedFile as DownloadedFile } from "https://deno.land/x/download@v1.0.1/mod.ts";
import { JenkinsPlugins, GithubPlugins } from './plugins.ts';
import { encode } from "https://deno.land/std@0.171.0/encoding/hex.ts";

import cache from './cache.json' assert { type: "json" };

const octokit = Deno.env.get('GITHUB_TOKEN') ? new Octokit({
  auth: Deno.env.get('GITHUB_TOKEN'),
}) : new Octokit();

const relativeTime = new Intl.RelativeTimeFormat('en-US', {
  style: "long"
})

const relativeDate = Math.floor((cache.updatedAt - Date.now()) / 60000)
if (-relativeDate <= 60) {
  console.log(`Cache was updated ${relativeTime.format(relativeDate, 'minutes')}. Skipping update check.`);
  Deno.exit();
}
else
  console.log(`Cache was updated ${relativeTime.format(relativeDate, 'minute')}. Checking for updates...`);

async function getJenkinsRelease(url: string, jobs: string[]): Promise<JenkinsRelease[]> {
  url = `${url}job/${jobs.reduce((acc, job) => `${acc}/job/${job}`)}/lastStableBuild/api/json`
  return await fetch(url)
    .then(res => res.json())
    .then(res => res.artifacts);
}

async function getHash(file: string): Promise<string> {
  return new TextDecoder()
    .decode(
      encode(
        new Uint8Array(
          await crypto.subtle.digest(
            'SHA-256',
            await Deno.readFile(file)
          )
        )
      )
    )
}

async function getGithubRelease(author: string, repo: string): Promise<Array<{ name: string, url: string}>> {
  octokit
  const response: { data: GithubRelease[] } = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner: author,
    repo: repo,
  });
  return response.data[0].assets.map(asset => ({ name: asset.name, url: asset.browser_download_url }));
}

async function getLatestVelocity(): Promise<string> {
  const { versions }: PaperMCVersions = await fetch('https://api.papermc.io/v2/projects/velocity').then(res => res.json());
  const latestVersion: string = versions[versions.length - 1];
  const { builds }: PaperMCBuildsController = await fetch(`https://api.papermc.io/v2/projects/velocity/versions/${latestVersion}/builds`).then(res => res.json());
  const parsedBuild: Velocity = builds
    .map(build => ({
      build: build.build,
      sha256: build.downloads.application.sha256,
      url: `https://api.papermc.io/v2/projects/velocity/versions/${latestVersion}/builds/${build.build}/downloads/${build.downloads.application.name}`
    }))
    .find(build => build.build === Math.max(...builds.map(build => build.build))) as Velocity;
  return parsedBuild.url;
}

const Plugin: Destination = {
  dir: './cache/plugins',
  file: 'plugin',
  mode: 0o755,
}
console.log("Downloading latest plugins");

for (const plugin of GithubPlugins) {
  const releases = await getGithubRelease(plugin.author, plugin.repo);
  for (const release of releases) {
    if (release.name.startsWith(plugin.filter[0]) && release.name.endsWith(plugin.filter[1])) {
      Plugin.file = `${plugin.name}.jar`;
      const Download: DownloadedFile = await download(release.url, Plugin);
      console.log(`Downloaded ${plugin.name}, into ${Download.dir} with ${(Download.size / 1024 * 10 >> 0) / 10}KiB`);
      break;
    }
  }
}

for (const plugin of JenkinsPlugins) {
  const url = `${plugin.url}job/${plugin.job.reduce((acc, job) => `${acc}/job/${job}`)}/lastStableBuild/artifact/`
  const releases = await getJenkinsRelease(plugin.url, plugin.job);
  for (const release of releases) {
    if (release.fileName.startsWith(plugin.filter[0]) && release.fileName.endsWith(plugin.filter[1])) {
      Plugin.file = `${plugin.name}.jar`;
      const Download: DownloadedFile = await download(url + release.relativePath, Plugin);
      console.log(`Downloaded ${plugin.name}, into ${Download.dir} with ${(Download.size / 1024 * 10 >> 0) / 10}KiB`);
      break;
    }
  }
}

const VelocityFile: Destination = {
  dir: './cache',
  file: 'velocity.jar',
  mode: 0o755,
}

const velocity = await getLatestVelocity();
const Download: DownloadedFile = await download(velocity, VelocityFile);
console.log(`Downloaded latest Velocity, into ${Download.dir} with ${(Download.size / 1024 * 10 >> 0) / 10}KiB`);
await (getGithubRelease('vincss', 'mcsleepingserverstarter').then(
  releases => releases.filter(
    release => release.name.startsWith('mcsleepingserverstarter') && release.name.endsWith('linux-x64')
  )[0]
)
.then(
  release => download(release.url, {
    file: 'mcsleepingserverstarter',
    dir: './cache',
    mode: 0o755
  })
)
.then(
  d => console.log(`Downloaded latest mcsleepingserverstarter, into ${d.dir} with ${(d.size / 1024 * 10 >> 0) / 10}KiB`)
))

const pluginCache: Plugin[] = []

for (const file of Deno.readDirSync('./cache/plugins')) {
  if (file.isFile)
    pluginCache.push({
      name: file.name,
      sha256: await getHash(`./cache/plugins/${file.name}`)
  })
}

const cacheFile: CacheFile = {
  velocity: {
    name: 'velocity.jar',
    sha256: await getHash('./cache/velocity.jar')
  },
  updatedAt: Date.now(),
  plugins: pluginCache
}

await Deno.writeTextFile('./cache.json', JSON.stringify(cacheFile, null, 2));

console.log("Done!");
Deno.exit(0);
export { };
