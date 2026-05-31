import Papa from 'papaparse';

export function parseCSV(text, options = {}) {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      ...options,
      complete(results) {
        if (results.errors.length > 0) {
          const critical = results.errors.filter(e => e.type !== 'FieldMismatch');
          if (critical.length > 0 && !options.quiet) {
            console.warn('CSV parse errors:', critical);
          }
        }
        resolve(results.data);
      },
      error(err) {
        reject(err);
      }
    });
  });
}

export function parseCSVStream(text, chunkCallback, completeCallback, options = {}) {
  Papa.parse(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
    chunkSize: 1024 * 512,
    ...options,
    chunk(results) {
      chunkCallback(results.data, results.meta);
    },
    complete() {
      completeCallback();
    },
    error(err) {
      console.error('CSV stream error:', err);
    }
  });
}
