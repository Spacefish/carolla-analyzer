import L from 'leaflet';

function sortEventsByTimestamp(events) {
  return [...events].sort((a, b) => {
    const tA = a.recordedAtMillis || (a.timestamp ? new Date(a.timestamp).getTime() : 0);
    const tB = b.recordedAtMillis || (b.timestamp ? new Date(b.timestamp).getTime() : 0);
    return tA - tB;
  });
}

export function createTripMap(containerId, events, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const map = L.map(containerId, {
    zoomControl: true,
    attributionControl: false
  }).setView([48.8, 8.9], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  if (!events || events.length === 0) return map;

  const sorted = sortEventsByTimestamp(events);
  const coords = [];

  for (const evt of sorted) {
    if (evt.lat !== null && evt.lng !== null) {
      coords.push([evt.lat, evt.lng]);
    }
  }

  if (coords.length > 0) {
    const polyline = L.polyline(coords, {
      color: options.color || '#4fc3f7',
      weight: options.weight || 6,
      opacity: 0.9
    }).addTo(map);

    if (options.onClick) {
      polyline.on('click', options.onClick);
    }

    if (coords.length >= 2) {
      const start = coords[0];
      const end = coords[coords.length - 1];

      L.circleMarker(start, {
        radius: 6,
        fillColor: '#4caf50',
        color: '#fff',
        weight: 2,
        fillOpacity: 1
      }).addTo(map).bindTooltip('Start', { permanent: false });

      L.circleMarker(end, {
        radius: 6,
        fillColor: '#f44336',
        color: '#fff',
        weight: 2,
        fillOpacity: 1
      }).addTo(map).bindTooltip('End', { permanent: false });
    }

    map.fitBounds(polyline.getBounds().pad(0.1));
  }

  return map;
}

export function createMultiTripMap(containerId, tripsWithEvents, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const map = L.map(containerId, {
    zoomControl: true,
    attributionControl: false
  }).setView([48.8, 8.9], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const allCoords = [];

  const colors = ['#4fc3f7', '#ff9800', '#9c27b0', '#4caf50', '#f44336', '#00bcd4', '#ffeb3b', '#e91e63'];

  for (let i = 0; i < tripsWithEvents.length; i++) {
    const { trip, events } = tripsWithEvents[i];
    const sorted = sortEventsByTimestamp(events);
    const coords = [];

    for (const evt of sorted) {
      if (evt.lat !== null && evt.lng !== null) {
        coords.push([evt.lat, evt.lng]);
      }
    }

    if (coords.length < 2) continue;

    const color = colors[i % colors.length];
    const polyline = L.polyline(coords, {
      color,
      weight: 5,
      opacity: 0.7
    }).addTo(map);

    if (options.onTripClick) {
      const tripIndex = trip.index;
      polyline.on('click', () => options.onTripClick(tripIndex));
    }

    allCoords.push(...coords);
  }

  if (allCoords.length > 0) {
    map.fitBounds(L.latLngBounds(allCoords).pad(0.1));
  }

  return map;
}
