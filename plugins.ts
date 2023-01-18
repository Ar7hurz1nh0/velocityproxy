export const GithubPlugins: GitHub[] = [
  { name: 'MiniMOTD', author: 'jpenilla', repo: 'MiniMOTD', filter: ['minimotd-velocity', '.jar'] },
  { name: 'ViaVersion', author: 'ViaVersion', repo: 'ViaVersion', filter: ['ViaVersion', '.jar'] },
  { name: 'Maintenance', author: 'kennytv', repo: 'Maintenance', filter: ['MaintenanceVelocity', '.jar']}
]

export const JenkinsPlugins: Jenkins[] = [
  { name: 'Geyser', url: "https://ci.opencollab.dev/", job: ['GeyserMC', 'Geyser', 'master'], filter: ['Geyser-Velocity', '.jar'] },
  { name: 'Floodgate', url: "https://ci.opencollab.dev/", job: ['GeyserMC', 'Floodgate', 'master'], filter: ['floodgate-velocity', '.jar'] },
  { name: 'AutoReconnect', url: "https://ci.codemc.io/", job: ['flori4nk', 'VelocityAutoReconnect'], filter: ['VelocityAutoReconnect', '.jar'] }
]