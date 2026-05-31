import './styles/app.css';
import { render as renderApp } from './app.js';
import { route, init } from './router.js';
import { getContentContainer } from './app.js';
import { getState, setData } from './store.js';
import { setLocale } from './i18n.js';
import * as upload from './modules/upload.js';
import * as dashboard from './modules/dashboard.js';
import * as tripList from './modules/trip-list.js';
import * as tripDetail from './modules/trip-detail.js';
import * as mapView from './modules/map-view.js';
import * as warningLights from './modules/warning-lights.js';
import * as dictionary from './modules/dictionary.js';

const appEl = document.getElementById('app');

const savedLocale = getState().locale;
setLocale(savedLocale);

renderApp(appEl);

const container = getContentContainer();

route('upload', upload);
route('dashboard', dashboard);
route('trips', tripList);
route('trips/:id', tripDetail);
route('map', mapView);
route('warnings', warningLights);
route('dict', dictionary);

init(container);
