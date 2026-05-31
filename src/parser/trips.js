import { parseCSV } from './csv.js';

export async function parseTrips(text) {
  const rows = await parseCSV(text);
  const trips = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const distanceM = parseFloat(r.DISTANCE_TRAVELLED) || 0;
    const fuelL = parseFloat(r.FUEL_CONSUMPTION) || 0;
    const avgSpeed = parseFloat(r.AVERAGE_SPEED) || 0;
    const maxSpeed = parseFloat(r.MAX_SPEED) || 0;

    const timeParts = (r.TOTAL_TIME || '00:00:00').split(':').map(Number);
    const durationSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + (timeParts[2] || 0);

    trips.push({
      index: i,
      startTime: r.TRIP_START_TIME || '',
      endTime: r.TRIP_END_TIME || '',
      distanceKm: +(distanceM / 1000).toFixed(3),
      distanceM,
      fuelL,
      avgSpeed: +avgSpeed.toFixed(2),
      maxSpeed,
      durationSeconds,
      durationStr: r.TOTAL_TIME || '00:00:00',
      endLat: r.TRIPEND_LAT ? parseFloat(r.TRIPEND_LAT) : null,
      endLng: r.TRIPEND_LNG ? parseFloat(r.TRIPEND_LNG) : null,
      fuelLPer100km: distanceM > 0 ? +(fuelL / (distanceM / 100000)).toFixed(2) : 0,
      deviceType: r.DEVICE_TYPE || '',
      vin: r.VIN || ''
    });
  }

  return trips;
}
