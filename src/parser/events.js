import { parseCSV } from './csv.js';

function parseJSONField(str, label) {
  if (!str || str.trim() === '') return {};
  try {
    const cleaned = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn(`Failed to parse ${label} JSON:`, e.message);
    return {};
  }
}

export async function parseEvents(text) {
  const rows = await parseCSV(text);
  const eventsByTripId = {};
  let totalRows = rows.length;

  for (let i = 0; i < totalRows; i++) {
    const r = rows[i];
    if (!r.TRIP_ID) continue;

    const tripId = r.TRIP_ID.trim();
    if (!tripId) continue;

    const canData = parseJSONField(r.CAN, 'CAN');
    const opData = parseJSONField(r.OP, 'OP');

    const event = {
      lat: r.LAT ? parseFloat(r.LAT) : null,
      lng: r.LNG ? parseFloat(r.LNG) : null,
      speed: r.SPEED ? parseFloat(r.SPEED) : null,
      timestamp: r.AQUIRED_DATE_TIME || r.RECORDED_AT || '',
      recordedAtMillis: r.RECORDED_AT_MILLIS ? parseInt(r.RECORDED_AT_MILLIS, 10) : null,
      heading: r.HEADING ? parseFloat(r.HEADING) : null,
      gpsQuality: r.GPS_QUALITY ? parseInt(r.GPS_QUALITY, 10) : null,
      estimatedMileage: r.ESTIMATED_MILEAGE ? parseFloat(r.ESTIMATED_MILEAGE) : null,
      messageId: r.MESSAGE_ID ? parseInt(r.MESSAGE_ID, 10) : null,
      isVirtual: r.IS_VIRTUAL === 'true' || r.IS_VIRTUAL === '1',
      tripEndTime: r.TRIP_END_TIME || '',

      odo: canData['32'] ? canData['32'].trim() : null,
      odoUnit: canData['33'] ? canData['33'].trim() : null,
      fuelConsumption: canData['34'] ? parseFloat(canData['34']) : null,

      op_tripDistanceM: opData['1'] ? parseFloat(opData['1']) : null,
      op_cumDistanceM: opData['2'] ? parseFloat(opData['2']) : null,
      op_tripTimeS: opData['7'] ? parseFloat(opData['7']) : null,
      op_cumTimeS: opData['8'] ? parseFloat(opData['8']) : null,
      op_tripFuelMl: opData['13'] ? parseFloat(opData['13']) : null,
      op_cumFuelMl: opData['14'] ? parseFloat(opData['14']) : null,
      op_speedKmh: opData['19'] ? parseFloat(opData['19']) : null,
      op_accel: opData['20'] ? parseFloat(opData['20']) : null,
      op_decel: opData['21'] ? parseFloat(opData['21']) : null,
      op_curfew: opData['22'] ? opData['22'].toString().trim() : null,
      op_geofence: opData['23'] ? parseFloat(opData['23']) : null,
      op_crash: opData['24'] ? parseInt(opData['24'], 10) : null,
      op_sos: opData['25'] ? parseInt(opData['25'], 10) : null
    };

    if (!eventsByTripId[tripId]) {
      eventsByTripId[tripId] = [];
    }
    eventsByTripId[tripId].push(event);
  }

  return { eventsByTripId, totalRows };
}
