export type Config = {
  ags: string | string[]
  downgradeLhpSeverity: boolean
  downgradeCancelSeverity: boolean
  excludeProviders: string[]
  hideCancelledWarnings: boolean
  unwantedTitles: string | string[]
  mergeAlerts: boolean
  filterTitles: boolean
  maxAgeInHours: number
  maxWidth?: string
  mergeAlerts?: boolean
  mergeAlertsById: boolean
  mergeAlertsByTitle: boolean
  showCity: boolean
  showDate: boolean
  showIcon: boolean
  showNoWarning: boolean
  theme: string
  updateIntervalInSeconds: number
}
