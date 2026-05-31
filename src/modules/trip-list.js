import { getState } from '../store.js';
import { navigate } from '../router.js';
import { formatDate, formatTime, formatDuration, formatLPer100km } from '../utils/format.js';
import { t } from '../i18n.js';

let currentSort = { col: 'startTime', dir: 'asc' };
let currentSearch = '';

export function render(container) {
  const state = getState();
  buildView(container, state);
}

function buildView(container, state) {
  container.innerHTML = `
    <div class="module-header">
      <h2>${t('tripList.title')}</h2>
      <div class="trip-list-controls">
        <input type="text" class="search-input" id="tripSearch" placeholder="${t('tripList.searchPlaceholder')}" />
      </div>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="tripTable">
        <thead>
          <tr>
            <th data-col="startTime">${t('tripList.date')} &darr;</th>
            <th data-col="distanceKm">${t('tripList.distance')}</th>
            <th data-col="durationSeconds">${t('tripList.duration')}</th>
            <th data-col="avgSpeed">${t('tripList.avgSpeed')}</th>
            <th data-col="maxSpeed">${t('tripList.maxSpeed')}</th>
            <th data-col="fuelL">${t('tripList.fuel')}</th>
            <th data-col="fuelLPer100km">${t('tripList.consumption')}</th>
          </tr>
        </thead>
        <tbody id="tripTableBody"></tbody>
      </table>
    </div>
  `;

  const searchInput = document.getElementById('tripSearch');
  const tableBody = document.getElementById('tripTableBody');
  const headers = document.querySelectorAll('#tripTable th');

  let filtered = [...state.trips];

  filtered.sort((a, b) => {
    let valA = a[currentSort.col];
    let valB = b[currentSort.col];
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }
    if (valA < valB) return currentSort.dir === 'asc' ? -1 : 1;
    if (valA > valB) return currentSort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable(filtered, tableBody);

  headers.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (currentSort.col === col) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.col = col;
        currentSort.dir = 'asc';
      }
      buildView(container, state);
    });
  });

  searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value.toLowerCase();
    const filtered2 = state.trips.filter(t => {
      const date = t.startTime ? t.startTime.slice(0, 10) : '';
      return date.includes(currentSearch);
    });
    filtered2.sort((a, b) => {
      let valA = a[currentSort.col];
      let valB = b[currentSort.col];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }
      if (valA < valB) return currentSort.dir === 'asc' ? -1 : 1;
      if (valA > valB) return currentSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    renderTable(filtered2, tableBody);
  });
}

function renderTable(trips, tbody) {
  tbody.innerHTML = '';
  for (const trip of trips) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(trip.startTime)} ${formatTime(trip.startTime)}</td>
      <td>${trip.distanceKm.toFixed(1)} km</td>
      <td>${formatDuration(trip.durationSeconds)}</td>
      <td>${trip.avgSpeed.toFixed(1)} km/h</td>
      <td>${trip.maxSpeed} km/h</td>
      <td>${trip.fuelL.toFixed(2)} L</td>
      <td>${formatLPer100km(trip.fuelLPer100km)}</td>
    `;
    row.addEventListener('click', () => navigate(`#trips/${trip.index}`));
    tbody.appendChild(row);
  }

  if (trips.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted">${t('tripList.noTrips')}</td></tr>`;
  }
}

export function destroy() {
  currentSort = { col: 'startTime', dir: 'asc' };
  currentSearch = '';
}
