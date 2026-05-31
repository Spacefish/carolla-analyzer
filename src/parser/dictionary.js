import { parseCSV } from './csv.js';

function parseUnits(str) {
  if (!str || str.trim() === '') return null;
  try {
    const cleaned = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function parseDictionary(text) {
  const rows = await parseCSV(text, { quiet: true });
  const dict = {};

  for (const r of rows) {
    const id = r.ID ? r.ID.trim() : '';
    if (!id) continue;

    const key = `ecall-${id}`;
    const description = r.DESCRIPTION ? r.DESCRIPTION.trim() : '';

    dict[key] = {
      id,
      description,
      deviceType: r.DEVICE_TYPE || '',
      units: parseUnits(r.UNITS),
      raw: r.DESCRIPTION || ''
    };
  }

  return dict;
}
