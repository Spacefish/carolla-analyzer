import { getState, subscribe } from './store.js';
import { reRender } from './router.js';
import { t, setLocale, getLang } from './i18n.js';

let navEl = null;
let langSwitcherEl = null;
let brandEl = null;

function renderNav() {
  if (!navEl) return;
  const lang = getLang();
  brandEl.textContent = t('nav.brand');
  document.querySelector('.nav-link[href="#dashboard"]').textContent = t('nav.dashboard');
  document.querySelector('.nav-link[href="#trips"]').textContent = t('nav.trips');
  document.querySelector('.nav-link[href="#map"]').textContent = t('nav.map');
  document.querySelector('.nav-link[href="#warnings"]').textContent = t('nav.warnings');
  document.querySelector('.nav-link[href="#dict"]').textContent = t('nav.dictionary');
  langSwitcherEl.innerHTML = `
    <select id="langSelect" class="lang-select">
      <option value="en" ${lang === 'en' ? 'selected' : ''}>EN</option>
      <option value="de" ${lang === 'de' ? 'selected' : ''}>DE</option>
    </select>
  `;
  document.getElementById('langSelect').addEventListener('change', (e) => {
    setLocale(e.target.value);
    renderNav();
    reRender();
  });
}

export function render(container) {
  container.innerHTML = `
    <nav class="nav-bar" id="navBar" style="display:none">
      <div class="nav-brand" id="navBrand">${t('nav.brand')}</div>
      <div class="nav-links">
        <a href="#dashboard" class="nav-link">${t('nav.dashboard')}</a>
        <a href="#trips" class="nav-link">${t('nav.trips')}</a>
        <a href="#map" class="nav-link">${t('nav.map')}</a>
        <a href="#warnings" class="nav-link">${t('nav.warnings')}</a>
        <a href="#dict" class="nav-link">${t('nav.dictionary')}</a>
      </div>
      <div class="nav-lang" id="navLang">
        <select id="langSelect" class="lang-select">
          <option value="en" ${getLang() === 'en' ? 'selected' : ''}>EN</option>
          <option value="de" ${getLang() === 'de' ? 'selected' : ''}>DE</option>
        </select>
      </div>
    </nav>
    <main id="mainContent"></main>
  `;

  navEl = document.getElementById('navBar');
  brandEl = document.getElementById('navBrand');
  langSwitcherEl = document.getElementById('navLang');

  document.getElementById('langSelect').addEventListener('change', (e) => {
    setLocale(e.target.value);
    renderNav();
    reRender();
  });

  subscribe((state) => {
    if (state.loaded) {
      navEl.style.display = 'flex';
    }
  });
}

export function getContentContainer() {
  return document.getElementById('mainContent');
}
