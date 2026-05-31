import { getState, getTrip, getEventsForTrip } from '../store.js';
import { navigate } from '../router.js';
import { createTripMap } from '../components/trip-map.js';
import { createSpeedChart } from '../components/speed-chart.js';
import { formatDate, formatTime, formatDateTime, formatDuration, formatLPer100km, formatSpeed } from '../utils/format.js';

function sortEventsByTimestamp(events) {
  return [...events].sort((a, b) => {
    const tA = a.recordedAtMillis || (a.timestamp ? new Date(a.timestamp).getTime() : 0);
    const tB = b.recordedAtMillis || (b.timestamp ? new Date(b.timestamp).getTime() : 0);
    return tA - tB;
  });
}

let currentMap = null;
let currentChart = null;

export function render(container, params) {
  const index = parseInt(params.id, 10);
  const trip = getTrip(index);

  if (!trip) {
    container.innerHTML = '<div class="error-msg">Trip not found</div>';
    return;
  }

  const state = getState();
  const events = sortEventsByTimestamp(getEventsForTrip(trip));

  container.innerHTML = `
    <div class="module-header">
      <h2>Trip Detail</h2>
      <div class="trip-nav">
        <button class="btn" id="prevTrip" ${index === 0 ? 'disabled' : ''}>&larr; Previous</button>
        <span class="trip-nav-index">Trip ${index + 1} of ${state.trips.length}</span>
        <button class="btn" id="nextTrip" ${index === state.trips.length - 1 ? 'disabled' : ''}>Next &rarr;</button>
      </div>
    </div>
    <div class="trip-detail-grid">
      <div class="card trip-detail-map">
        <div class="card-header">Route Map</div>
        <div id="tripMap" class="map-container"></div>
      </div>
      <div class="card trip-detail-stats">
        <div class="card-header">Trip Stats</div>
        <div class="detail-stats" id="detailStats"></div>
      </div>
      <div class="card trip-detail-chart">
        <div class="card-header">Speed Over Time</div>
        <div id="speedChart" class="chart-container"></div>
      </div>
    </div>
  `;

  const statsContainer = document.getElementById('detailStats');
  const stats = [
    { label: 'Start', value: formatDateTime(trip.startTime) },
    { label: 'End', value: formatDateTime(trip.endTime) },
    { label: 'Duration', value: formatDuration(trip.durationSeconds) },
    { label: 'Distance', value: `${trip.distanceKm.toFixed(1)} km` },
    { label: 'Avg Speed', value: formatSpeed(trip.avgSpeed) },
    { label: 'Max Speed', value: formatSpeed(trip.maxSpeed) },
    { label: 'Fuel', value: `${trip.fuelL.toFixed(2)} L` },
    { label: 'Consumption', value: formatLPer100km(trip.fuelLPer100km) }
  ];

  for (const s of stats) {
    const row = document.createElement('div');
    row.className = 'detail-stat-row';
    row.innerHTML = `
      <span class="detail-stat-label">${s.label}</span>
      <span class="detail-stat-value">${s.value}</span>
    `;
    statsContainer.appendChild(row);
  }

  if (events.length > 0) {
    setTimeout(() => {
      currentMap = createTripMap('tripMap', events);
      currentChart = createSpeedChart('speedChart', events);
    }, 50);
  } else {
    document.getElementById('tripMap').innerHTML = '<p class="text-muted" style="padding:20px">No GPS events for this trip</p>';
    document.getElementById('speedChart').innerHTML = '<p class="text-muted" style="padding:20px">No speed data for this trip</p>';
  }

  document.getElementById('prevTrip').addEventListener('click', () => {
    if (index > 0) navigate(`#trips/${index - 1}`);
  });

  document.getElementById('nextTrip').addEventListener('click', () => {
    if (index < state.trips.length - 1) navigate(`#trips/${index + 1}`);
  });
}

export function destroy() {
  if (currentMap) {
    currentMap.remove();
    currentMap = null;
  }
  if (currentChart) {
    currentChart.dispose();
    currentChart = null;
  }
}
