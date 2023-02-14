
export const GithubPlugins: GitHub[] = [
  { name: 'ViaVersion', author: 'ViaVersion', repo: 'ViaVersion', filter: ['ViaVersion', '.jar'] },
  { name: 'ViaBackwards', author: 'ViaVersion', repo: 'ViaBackwards', filter: ['ViaBackwards', '.jar'] },
  { name: 'raknetify', author: 'RelativityMC', repo: 'raknetify', filter: ['raknetify-velocity', '.jar'] },
  { name: 'LimboAPI', author: 'Elytrium', repo: 'LimboAPI', filter: ['limboapi', '.jar'] },
  { name: 'FastMOTD', author: 'Elytrium', repo: 'FastMOTD', filter: ['FastMOTD', '.jar'] },
  { name: 'LimboAuth', author: 'Elytrium', repo: 'LimboAuth', filter: ['limboauth', '.jar'] },
  { name: 'Maintenance', author: 'kennytv', repo: 'Maintenance', filter: ['MaintenanceVelocity', '.jar']},
  { name: 'UnifiedMetrics', author: 'Cubxity', repo: 'UnifiedMetrics', filter: ['unifiedmetrics-platform-velocity', '.jar'] },
  // { name: 'LimboFilter', author: 'Elytrium', repo: 'LimboFilter', filter: ['limbofilter', '.jar'] },
]

export const JenkinsPlugins: Jenkins[] = [
  { name: 'Geyser', url: "https://ci.opencollab.dev/", job: ['GeyserMC', 'Geyser', 'master'], filter: ['Geyser-Velocity', '.jar'] },
  { name: 'Floodgate', url: "https://ci.opencollab.dev/", job: ['GeyserMC', 'Floodgate', 'master'], filter: ['floodgate-velocity', '.jar'] },
  { name: 'AutoReconnect', url: "https://ci.codemc.io/", job: ['flori4nk', 'VelocityAutoReconnect'], filter: ['VelocityAutoReconnect', '.jar'] }
]