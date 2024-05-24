#! /bin/env bun

import { $, semver } from "bun";
import axios from "axios";
import { version } from "./package.json"
import chalk from "chalk";
import ansiEscapes from "ansi-escapes";

console.clear();

process.once("exit", (_) => console.log());

const headers = {
  "User-Agent": `ar7hurz1nh0/velocity/${version} (arthurbr@cdmd.dev)`,
}

const lines: string[] = []
let lines_id = 0;

async function render_line(line: string): Promise<number> {
  const id = lines_id++;
  lines[id] = line;
  await Bun.write(Bun.stdout, `${ansiEscapes.cursorTo(0, id)}${line}\n`);
  return id;
}

async function append_to_line(id: number, text: string) {
  await Bun.write(Bun.stdout, `${ansiEscapes.cursorTo(0, id)}${lines[id]}${text}\n`);
}

const fetch_ = axios.create({
  headers: {
    ...headers
  }
})

const fetch = async (...args: Parameters<typeof fetch_>) => {
  const line_id = await render_line(chalk.blueBright(`Fetching ${chalk.cyanBright.underline(args[0])}... `));
  return fetch_(...args).then(async r => {
    await append_to_line(line_id, chalk.greenBright("Done!"));
    return r;
  }).catch(async e => {
    await append_to_line(line_id, chalk.redBright("ERROR!"));
    return e;
  });
}

async function download(url: string, path: string) {
  await $`curl -fsSL "${url}" > "${path}"`
}

///---- Velocity, Geyser, Floodgate stuff ----///

async function get_latest_version_project(api: string, project: string): Promise<string> {
  const url = `${api}/v2/projects/${project}`;
  const { versions }: ProjectVersions = await fetch(url).then(res => res.data);
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const latestVersion: string = versions.sort(semver.order).pop()!;
  return latestVersion;
}

async function get_latest_build_project(api: string, project: string): Promise<Build> {
  const latestVersion: string = await get_latest_version_project(api, project);
  const { builds }: Project = await fetch(`${api}/v2/projects/${project}/versions/${latestVersion}/builds`).then(res => res.data);
  return {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    ...builds.find(build => build.build === Math.max(...builds.map(build => build.build)))!,
    version: latestVersion,
  };
}

async function check_latest_velocity(): Promise<File> {
  const build = await get_latest_build_project(
    "https://api.papermc.io",
    "velocity"
  )

  await render_line(chalk.blueBright(`${chalk.greenBright("Velocity")} latest version: ${chalk.yellow(build.version)} build ${chalk.yellow(build.build)}`));

  return {
    build: build.build,
    version: build.version,
    ...build.downloads.application
  }
}

async function check_latest_geyser(): Promise<File> {
  const build = await get_latest_build_project(
    "https://download.geysermc.org",
    "geyser"
  )

  await render_line(chalk.blueBright(`${chalk.greenBright("Geyser")} latest version: ${chalk.yellow(build.version)} build ${chalk.yellow(build.build)}`));

  return {
    build: build.build,
    version: build.version,
    ...build.downloads.velocity
  }
}
async function check_latest_floodgate(): Promise<File> {
  const build = await get_latest_build_project(
    "https://download.geysermc.org",
    "floodgate"
  )

  await render_line(chalk.blueBright(`${chalk.greenBright("Floodgate")} latest version: ${chalk.yellow(build.version)} build ${chalk.yellow(build.build)}`));

  return {
    build: build.build,
    version: build.version,
    ...build.downloads.velocity
  }
}

async function download_velocity(version: string, build: number) {
  const line_id = await render_line(chalk.blueBright(`Downloading Velocity ${chalk.yellow(version)} build ${chalk.yellow(build)}... `));
  await download(`https://api.papermc.io/v2/projects/velocity/versions/${version}/builds/${build}/downloads/velocity-${version}-${build}.jar`, "./velocity.jar");
  await append_to_line(line_id, chalk.greenBright("Done!"));
}

async function download_geyser(version: string, build: number) {
  const line_id = await render_line(chalk.blueBright(`Downloading Geyser ${chalk.yellow(version)} build ${chalk.yellow(build)}... `));
  await download(`https://download.geysermc.org/v2/projects/geyser/versions/${version}/builds/${build}/downloads/velocity`, "./plugins/geyser.jar");
  await append_to_line(line_id, chalk.greenBright("Done!"));
}

async function download_floodgate(version: string, build: number) {
  const line_id = await render_line(chalk.blueBright(`Downloading Floodgate ${chalk.yellow(version)} build ${chalk.yellow(build)}... `));
  await download(`https://download.geysermc.org/v2/projects/floodgate/versions/${version}/builds/${build}/downloads/velocity`, "./plugins/floodgate.jar");
  await append_to_line(line_id, chalk.greenBright("Done!"));
}

/// !---- ---- ---- ---- ---- ---- ---- ----! ///

///---- Github plugins ----///

/// !---- ---- ---- ---- ---- ---- ---- ----! ///

///---- Modrinth plugins ----///

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "long" });
const now = new Date().getTime();

async function get_modrinth_project(mod: ModrinthPlugin): Promise<ModrinthProject> {
  return await fetch(`https://api.modrinth.com/v2/project/${mod.url.split('/').pop()}`).then(res => res.data);
}

async function get_latest_version_modrinth(mod: ModrinthPlugin): Promise<[ModrinthFile, string] | [ModrinthPlugin, string]> {
  const { title, id: project_id } = await get_modrinth_project(mod);
  let res: ModrinthVersion[] | undefined = await fetch(`https://api.modrinth.com/v2/project/${project_id}/version?loaders=["velocity"]`).then(res => res.data);

  if (typeof res?.filter === "undefined" || typeof res?.sort === "undefined") return [mod, title];

  if (mod.version_type) {
    res = res.filter(version => version.version_type === mod.version_type);
  }

  res = res.sort((v1, v2) => new Date(v2.date_published).getTime() - new Date(v1.date_published).getTime());
  const version = res[0]

  const time = (() => {
    const raw = (new Date(version.date_published).getTime() - now) / 1000;
    let time = raw / 60 / 60 / 24 / 30;
    if (time > 1 || time < -1) return relative.format(Number((time).toFixed(0)), "months");
    time = raw / 60 / 60 / 24;
    if (time > 1 || time < -1) return relative.format(Number((time).toFixed(0)), "days");
    time = raw / 60 / 60;
    if (time > 1 || time < -1) return relative.format(Number((time).toFixed(0)), "hours");
    time = raw / 60;
    if (time > 1 || time < -1) return relative.format(Number((time).toFixed(0)), "minutes");
    if (time > 1 || time < -1) return relative.format(Number((raw).toFixed(0)), "seconds");
    return "at unknown time"
  })();

  await render_line(chalk.blueBright(
    `${chalk.greenBright(title)
    } latest version: ${chalk.yellow(version.version_number)
    }, published ${chalk.blueBright(time)}`)
  );

  const i = version.files.findIndex(file => file.filename.endsWith(".jar"));

  const file: ModrinthFile = {
    name: title,
    id: version.id,
    project_id: project_id,
    date: version.date_published,
    version: version.version_number,
    ...version.files[i].hashes
  };

  return [file, version.files[i].url];
}

async function download_modrinth(mod: ModrinthFile, url: string) {
  const line_id = await render_line(chalk.blueBright(`Downloading Modrinth plugin ${chalk.yellow(mod.name)}/${chalk.yellow(mod.version)}... `));
  const delay = new Promise((r) => setTimeout(r, 2000));
  await download(url, `./plugins/${mod.name}-${mod.project_id}-${mod.version}.jar`);
  await delay;
  await append_to_line(line_id, chalk.greenBright("Done!"));
}

/// !---- ---- ---- ---- ---- ---- ---- ----! ///

import { ModrinthPlugins } from './plugins'
import { mkdirSync, rmSync } from "node:fs"

function request_failed(plugin: [ModrinthPlugin, string] | [ModrinthFile, string]): plugin is [ModrinthPlugin, string] {
  return "url" in plugin[0];
}

let tries = 5;

// check if plugins.lock.json exists
if (await Bun.file("plugins.lock.json").exists()) {
  const lock: LockFile = await Bun.file("plugins.lock.json").json();
  {
    const latest_velocity = await check_latest_velocity();
    if (semver.order(latest_velocity.version, lock.velocity.version) === 1) {
      await download_velocity(latest_velocity.version, latest_velocity.build);
      lock.velocity = latest_velocity;
    }
  }
  {
    const latest_geyser = await check_latest_geyser();
    if (semver.order(latest_geyser.version, lock.geyser.version) === 1) {
      await download_geyser(latest_geyser.version, latest_geyser.build);
      lock.geyser = latest_geyser;
    }
  }
  {
    const latest_floodgate = await check_latest_floodgate();
    if (semver.order(latest_floodgate.version, lock.floodgate.version) === 1) {
      await download_floodgate(latest_floodgate.version, latest_floodgate.build);
      lock.floodgate = latest_floodgate;
    }
  }

  let modrinth_projects = await Promise.all(ModrinthPlugins.map(get_latest_version_modrinth));
  let failed_plugins: ModrinthPlugin[] = []

  do {
    failed_plugins = []
    for (let i = 0; i < modrinth_projects.length; i++) {
      const project = modrinth_projects[i];

      if (request_failed(project)) {
        failed_plugins.push(project[0]);
        await render_line(chalk.redBright(`Failed to get latest version of ${chalk.yellow(project[1])}. Retrying... (${chalk.bgRed.bold.white(`${tries} attemps left`)})`));
        continue;
      };

      const findIndex = lock.modrinth_plugins.findIndex(p => p.project_id === project[0].project_id);
      const find = lock.modrinth_plugins[findIndex];
      if (typeof find !== "undefined") {
        const [latest_version, url] = project;
        const latest_date = new Date(latest_version.date).getTime();
        const find_date = new Date(find.date).getTime();
        const diff = latest_date - find_date;
        if (find.version !== latest_version.version && diff > 0) {
          await download_modrinth(latest_version, url);
          rmSync(`./plugins/${find.name}-${find.project_id}-${find.version}.jar`)
          lock.modrinth_plugins[findIndex] = latest_version;
        }
      }
      else { // Plugin was not installed at first, so download it
        const [latest_version, url] = project;
        await download_modrinth(latest_version, url);
        lock.modrinth_plugins.push(latest_version);
      }
    }

    modrinth_projects = await Promise.all(failed_plugins.map(get_latest_version_modrinth));
  }
  while (tries-- > 0 || failed_plugins.length);

  if (failed_plugins.length) {
    throw new Error("Could not get some plugins.")
  }

  await Bun.write("plugins.lock.json", JSON.stringify(lock));
} else {
  // if not, create it
  const lock: LockFile = {
    lastUpdated: Date.now(),
    velocity: await check_latest_velocity(),
    // velocity: null as unknown as File,
    geyser: await check_latest_geyser(),
    floodgate: await check_latest_floodgate(),
    modrinth_plugins: []
  }

  // create folder for plugins
  mkdirSync("./plugins", { recursive: true });

  await download_velocity(lock.velocity.version, lock.velocity.build);
  await download_geyser(lock.geyser.version, lock.geyser.build);
  await download_floodgate(lock.floodgate.version, lock.floodgate.build);

  let modrinth_plugins: ([ModrinthFile, string] | [ModrinthPlugin, string])[] = await Promise.all(ModrinthPlugins.map(get_latest_version_modrinth));
  let failed_plugins: ModrinthPlugin[] = [];

  do {
    failed_plugins = []

    for (const plugin of modrinth_plugins) {
      if (request_failed(plugin)) {
        failed_plugins.push(plugin[0]);
        await render_line(chalk.redBright(`Failed to get latest version of ${chalk.yellow(plugin[1])}. Retrying... (${chalk.bgRed.bold.white(`${tries} attemps left`)})`));
        continue;
      };
      const [latest_version, url] = plugin;
      await download_modrinth(latest_version, url);
      lock.modrinth_plugins.push(latest_version);
    }

    modrinth_plugins = await Promise.all(failed_plugins.map(get_latest_version_modrinth));
  }
  while (tries-- > 0 || failed_plugins.length);

  if (failed_plugins.length) {
    throw new Error("Could not get some plugins.")
  }

  await Bun.write("plugins.lock.json", JSON.stringify(lock));
}

// This is needed because of cursors used above in the downloads phase
console.log()

import { config } from "./config";

Bun.spawn({
  cmd: [config.velocity.java_path, ...config.velocity.java_args],
})