///---- Velocity, Geyser, Floodgate stuff ----///

declare type ProjectVersions = {
  readonly project_id: string
  readonly project_name: string
  readonly versions: string[]
}

declare type Build = {
  readonly build: number,
  readonly version: string,
  readonly time: string,
  readonly channel: string,
  readonly promoted: boolean,
  readonly changes: Array<{ readonly commit: string, readonly summary: string, readonly message: string }>,
  readonly downloads: Record<string, { readonly name: string, readonly sha256: string }>,
}

declare type Project = {
  readonly project_id: string,
  readonly project_name: string,
  readonly builds: readonly Build[],
}

declare type File = {
  readonly name: string,
  readonly sha256: string,
  readonly build: number,
  readonly version: string,
}

/// !---- ---- ---- ---- ---- ---- ---- ----! ///

///---- Github plugins ----///
declare type GithubRelease = {
  readonly assets: {
    readonly name: string
    readonly browser_download_url: string
  }[]
  readonly message?: string
}


declare type GitHubPlugin = {
  readonly name: string
  readonly author: string
  readonly repo: string
  readonly filter: {
    readonly startsWith: string
    readonly endsWith: string
  }
}

/// !---- ---- ---- ---- ---- ---- ---- ----! ///

///---- Modrinth plugins ----///

declare type ModrinthPlugin = {
  readonly url: string
  readonly version_type?: "release" | "beta" | "alpha"
}

declare type ModrinthProject = {
  slug: string,
  title: string,
  description: string,
  categories: string[],
  client_side: string,
  server_side: string,
  body: string,
  status: string,
  requested_status: string,
  additional_categories: string[],
  issues_url: string,
  source_url: string,
  wiki_url: string,
  discord_url: string,
  donation_urls: Array<{ id: string, platform: string, url: string }>,
  project_type: "mod",
  downloads: 0,
  icon_url: string,
  color: number,
  thread_id: string,
  monetization_status: string,
  id: string,
  team: string,
  body_url: null,
  moderator_message: null,
  published: string,
  updated: string,
  approved: string,
  queued: string,
  followers: 0,
  license: {
    id: string,
    name: string,
    url: string
  },
  versions: string[],
  game_versions: string[],
  loaders: string[],
  gallery: Array<{ url: string, featured: boolean, title: string, description: string, created: string, ordering: number }>,
}

declare type ModrinthVersion = {
  game_versions: string[],
  loaders: string[],
  id: string,
  project_id: string,
  author_id: string,
  featured: boolean,
  name: string,
  version_number: string,
  changelog: string,
  changelog_url: null,
  date_published: string,
  downloads: number,
  version_type: string,
  status: string,
  requested_status: null,
  files: {
    hashes: {
      sha512: string,
      sha1: string
    },
    url: string,
    filename: string,
    primary: boolean,
    size: number,
    file_type: string
  }[],
  dependencies: {
    version_id: string,
    project_id: string,
    file_name: string,
    dependency_type: string
  }[],
}

declare type ModrinthFile = {
  readonly id: string
  readonly name: string
  readonly project_id: string
  readonly sha1: string
  readonly sha512: string
  readonly version: string
  readonly date: string
}

/// !---- ---- ---- ---- ---- ---- ---- ----! ///

///---- Lockfile ----///

declare type LockFile = {
  lastUpdated: number,
  velocity: File,
  geyser: File,
  floodgate: File,
  modrinth_plugins: ModrinthFile[],
}

/// !---- ---- ---- ---- ---- ---- ---- ----! ///

declare type Config = {
  velocity: {
    java_path: string,
    java_args: string[],
  }
}