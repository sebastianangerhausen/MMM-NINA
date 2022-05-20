import * as Log from 'logger'
import { Alert } from '../types/Alert'
import { Config } from '../types/Config'
import { daten } from './Regionalschluessel_2021-07-31.json'

export default class Utils {
  static transformNinaAlerts(alerts: Alert[], config: Config, alertAgs: string): Alert[] {
    const now = new Date().getTime()

    const city = daten.find((ags) => ags[0] === alertAgs)
    if (!city) {
      Log.warn(`AGS '${alertAgs}' konnte keiner Gemeinde zugeordnet werden.`)
    }

    const filtered = alerts.filter((alert) => {
      if (config.hideCancelledWarnings && alert.payload.data.severity === 'Cancel') {
        return false
      }

      return (
        (now - Date.parse(alert.sent)) / (1000 * 60 * 60) <= config.maxAgeInHours &&
        !config.excludeProviders.includes(alert?.payload?.data?.provider)
      )
    })

    return filtered.map((alert) => {
      if (alert?.payload?.data?.provider?.toLocaleLowerCase() === 'lhp' && config.downgradeLhpSeverity) {
        // eslint-disable-next-line no-param-reassign
        alert.payload.data.severity = 'Moderate'
      }

      if (alert.payload.data.msgType === 'Cancel' && config.downgradeCancelSeverity) {
        // eslint-disable-next-line no-param-reassign
        alert.payload.data.severity = 'Cancel'
      }

      // eslint-disable-next-line no-param-reassign
      alert.cityNames = [city[1]] || []

      return alert
    })
  }

  static removeDuplicates(alerts: Alert[], config: Config): Alert[] {
    const knownIds: string[] = []
    const knownTitles: string[] = []

    return alerts.filter((alert) => {
      if (config.mergeAlertsById) {
        if (knownIds.includes(alert.id)) {
          const existing = alerts.find((existingAlert) => existingAlert.id === alert.id)
          existing.cityNames = [...new Set([...existing.cityNames, ...alert.cityNames])]

          return false
        }
        knownIds.push(alert.id)
      }

      if (config.mergeAlertsByTitle) {
        if (knownTitles.includes(alert.i18nTitle.de)) {
          const existing = alerts.find((existingAlert) => existingAlert.i18nTitle.de === alert.i18nTitle.de)

          existing.cityNames = [...new Set([...existing.cityNames, ...alert.cityNames])]

          return false
        }
        knownTitles.push(alert.i18nTitle.de)
      }

      return true
    })
  }

static filter(alerts: Alert[], config: Config): Alert[] {

	let filteredAlerts: Alert[] = []

	// Lösche Warnungen mit ungewünschtem Titel.
	if (config.filterTitles) {
		const unwantedTitles = Array.isArray(config.unwantedTitles) ? config.unwantedTitles : [config.unwantedTitles]
		filteredAlerts = alerts.filter((alert) => !unwantedTitles.includes(alert.i18nTitle.de))
	} else{
		filteredAlerts = alerts
	}

	const knownIds: string[] = []
	if (config.mergeAlerts) {
		return filteredAlerts.filter((alert) => {
			  if (knownIds.includes(alert.id)) {
				const existing = filteredAlerts.find((existingAlert) => existingAlert.id === alert.id)
				existing.cityName += ` | ${alert.cityName}`

				return false
			  }
			  knownIds.push(alert.id)

			  return true
			})
	} else {
		return filteredAlerts
	}
}


static harmonizeAgs(ags: string): string {
    return `${ags.substring(0, ags.length - 7)}0000000`
  }
}
