import { getState, subscribe } from './store.js';
import { navigate } from './router.js';

let navEl = null;

export function render(container) {
  container.innerHTML = `
    <nav class="nav-bar" id="navBar" style="display:none">
      <div class="nav-brand">Carolla Analyzer</div>
      <div class="nav-links">
        <a href="#dashboard" class="nav-link">Dashboard</a>
        <a href="#trips" class="nav-link">Trips</a>
        <a href="#map" class="nav-link">Map</a>
        <a href="#warnings" class="nav-link">Warnings</a>
        <a href="#dict" class="nav-link">Dictionary</a>
      </div>
    </nav>
    <main id="mainContent"></main>
  `;

  navEl = document.getElementById('navBar');

  subscribe((state) => {
    if (state.loaded) {
      navEl.style.display = 'flex';
    }
  });
}

export function getContentContainer() {
  return document.getElementById('mainContent');
}
