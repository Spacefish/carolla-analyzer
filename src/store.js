const state = {
  trips: [],
  eventsByTripId: {},
  warnings: [],
  canDict: {},
  opDict: {},
  loaded: false,
  loadedFiles: [],
  locale: 'en'
};

const subscribers = new Set();

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function notify() {
  for (const fn of subscribers) {
    try { fn(state); } catch (e) { console.error('Store subscriber error:', e); }
  }
}

export function setData(data) {
  Object.assign(state, data, { loaded: true });
  notify();
}

export function getState() {
  return state;
}

export function getTrip(index) {
  return state.trips[index] || null;
}

export function getEventsForTrip(trip) {
  if (!trip) return [];
  const candidates = [];

  for (const [tripId, events] of Object.entries(state.eventsByTripId)) {
    if (events.length === 0) continue;
    const endTime = trip.endTime;
    if (!endTime) continue;

    const eventEndTime = events[0].tripEndTime;
    if (eventEndTime && eventEndTime === endTime) {
      candidates.push({ tripId, events });
    }
  }

  if (candidates.length === 1) return candidates[0].events;
  if (candidates.length > 1) {
    candidates.sort((a, b) => b.events.length - a.events.length);
    return candidates[0].events;
  }

  for (const [tripId, events] of Object.entries(state.eventsByTripId)) {
    if (events.length === 0) continue;
    const eventEndTime = events[0].tripEndTime;
    if (eventEndTime && trip.endTime) {
      const t1 = new Date(eventEndTime).getTime();
      const t2 = new Date(trip.endTime).getTime();
      if (Math.abs(t1 - t2) < 60000) {
        return events;
      }
    }
  }

  return [];
}
