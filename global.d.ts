declare interface Velocity {
  readonly build: number
  readonly sha256: string
  readonly url: string
}

declare interface GithubRelease {
  readonly assets: {
    readonly name: string
    readonly browser_download_url: string
  }[]
  readonly message?: string
}

declare interface PaperMCBuildsController {
  readonly builds: {
    readonly build: number
    readonly downloads: {
      readonly [key: string]: {
        readonly name: string
        readonly sha256: string
      }
    }
  }[]
}

declare interface PaperMCVersions {
  readonly versions: string[]
}

declare interface JenkinsRelease {
  readonly fileName: string
  readonly relativePath: string
}

declare interface GitHub {
  readonly name: string
  readonly author: string
  readonly repo: string
  readonly filter: [ string, string ]
}

declare interface Jenkins {
  readonly name: string
  readonly url: string
  readonly job: string[]
  readonly filter: [ string, string ]
}

declare interface Plugin {
  readonly name: string
  readonly sha256: string
}

declare interface CacheFile {
  readonly velocity: Plugin
  readonly plugins: Plugin[]
  readonly updatedAt: number
}