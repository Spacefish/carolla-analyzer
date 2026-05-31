import { getState, getEventsForTrip } from '../store.js';
import { navigate } from '../router.js';
import { createMultiTripMap } from '../components/trip-map.js';
import { t } from '../i18n.js';

let currentMap = null;

export function render(container) {
  const state = getState();

  container.innerHTML = `
    <div class="module-header">
      <h2>${t('mapView.title')}</h2>
    </div>
    <div class="card">
      <div id="multiTripMap" class="map-container" style="height:70vh"></div>
    </div>
  `;

  const tripsWithEvents = [];
  for (const trip of state.trips) {
    const events = getEventsForTrip(trip);
    if (events.length >= 2) {
      tripsWithEvents.push({ trip, events });
    }
  }

  setTimeout(() => {
    currentMap = createMultiTripMap('multiTripMap', tripsWithEvents, {
      onTripClick(tripIndex) {
        navigate(`#trips/${tripIndex}`);
      }
    });
  }, 50);
}

export function destroy() {
  if (currentMap) {
    currentMap.remove();
    currentMap = null;
  }
}
