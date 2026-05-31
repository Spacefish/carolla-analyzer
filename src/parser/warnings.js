import { parseCSV } from './csv.js';

export async function parseWarnings(text) {
  const rows = await parseCSV(text);
  if (rows.length === 0) return [];

  return rows.map((r, i) => ({
    index: i,
    warningType: r.WARNING_TYPE || '',
    warningTimestamp: r.WARNING_TIMESTAMP || '',
    warningDate: r.WARNING_DATE || '',
    mileageValue: r.WARNING_MILEAGE_VALUE ? parseFloat(r.WARNING_MILEAGE_VALUE) : null,
    mileageUnit: r.WARNING_MILEAGE_UNIT || '',
    latitude: r.LATITUDE ? parseFloat(r.LATITUDE) : null,
    longitude: r.LONGITUDE ? parseFloat(r.LONGITUDE) : null,
    status: r.WARNING_WARNINGLIGHTSTATUS === 'true' || r.WARNING_WARNINGLIGHTSTATUS === '1',
    symbol: r.WARNING_WARNINGLIGHTTYPE_SYMBOL || '',
    serialNumber: r.SERIALNUMBER || '',
    vin: r.VIN || ''
  }));
}
