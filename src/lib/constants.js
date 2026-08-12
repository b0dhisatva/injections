export const UNITS = ['mg', 'mcg', 'mL', 'IU', 'units', 'g']

export const ROUTES = [
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'subcutaneous', label: 'Subcutaneous' },
  { value: 'other', label: 'Other' },
]

export const SITES = [
  { key: 'left_deltoid', label: 'Left deltoid', short: 'L delt', group: 'Shoulder' },
  { key: 'right_deltoid', label: 'Right deltoid', short: 'R delt', group: 'Shoulder' },
  { key: 'left_ventrogluteal', label: 'Left ventrogluteal', short: 'L VG', group: 'Hip' },
  { key: 'right_ventrogluteal', label: 'Right ventrogluteal', short: 'R VG', group: 'Hip' },
  { key: 'left_glute', label: 'Left glute', short: 'L glute', group: 'Glute' },
  { key: 'right_glute', label: 'Right glute', short: 'R glute', group: 'Glute' },
  { key: 'left_thigh', label: 'Left thigh', short: 'L thigh', group: 'Thigh' },
  { key: 'right_thigh', label: 'Right thigh', short: 'R thigh', group: 'Thigh' },
  { key: 'left_abdomen', label: 'Left Lat', short: 'L Lat', group: 'Lat' },
  { key: 'right_abdomen', label: 'Right Lat', short: 'R Lat', group: 'Lat' },
  { key: 'other', label: 'Other site', short: 'Other', group: 'Other' },
]

export const COMPOUND_COLORS = ['#d36f4b', '#2a7772', '#b38a3e', '#6579a5', '#9a5f79', '#6a8052']

export const siteLabel = (siteKey) =>
  SITES.find((site) => site.key === siteKey)?.label ?? siteKey.replaceAll('_', ' ')

export const routeLabel = (routeKey) =>
  ROUTES.find((route) => route.value === routeKey)?.label ?? routeKey
