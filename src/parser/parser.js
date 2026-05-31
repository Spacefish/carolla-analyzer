import JSZip from 'jszip';
import { parseTrips } from './trips.js';
import { parseEvents } from './events.js';
import { parseWarnings } from './warnings.js';
import { parseDictionary } from './dictionary.js';

const CSV_FILES = {
  'DCM_TRIP.csv': 'trips',
  'DCM_TRIP_EVENT.csv': 'events',
  'ECARE_WARNING_LIGHTS.csv': 'warnings',
  'DICT_DCM_CAN_DATA.csv': 'canDict',
  'DICT_DCM_OPERATION_DATA.csv': 'opDict'
};

export async function parseZipFile(zipFile, onProgress) {
  const arrayBuffer = await zipFile.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const csvFiles = [];
  zip.forEach((relativePath, entry) => {
    if (!entry.dir && relativePath.toLowerCase().endsWith('.csv')) {
      const name = relativePath.split('/').pop();
      csvFiles.push({ name, entry, fullPath: relativePath });
    }
  });

  const total = csvFiles.length;
  let processed = 0;

  function report() {
    processed++;
    if (onProgress) {
      onProgress(processed, total);
    }
  }

  const result = {
    trips: [],
    eventsByTripId: {},
    warnings: [],
    canDict: {},
    opDict: {},
    loadedFiles: []
  };

  for (const { name, entry } of csvFiles) {
    try {
      const text = await entry.async('string');

      if (name === 'DCM_TRIP.csv') {
        result.trips = await parseTrips(text);
        result.loadedFiles.push(name);
      } else if (name === 'DCM_TRIP_EVENT.csv') {
        const eventsResult = await parseEvents(text);
        result.eventsByTripId = eventsResult.eventsByTripId;
        result.loadedFiles.push(name);
      } else if (name === 'ECARE_WARNING_LIGHTS.csv') {
        result.warnings = await parseWarnings(text);
        result.loadedFiles.push(name);
      } else if (name === 'DICT_DCM_CAN_DATA.csv') {
        result.canDict = await parseDictionary(text);
        result.loadedFiles.push(name);
      } else if (name === 'DICT_DCM_OPERATION_DATA.csv') {
        result.opDict = await parseDictionary(text);
        result.loadedFiles.push(name);
      }
    } catch (err) {
      console.warn(`Failed to parse ${name}:`, err.message);
    }

    report();
  }

  return result;
}
