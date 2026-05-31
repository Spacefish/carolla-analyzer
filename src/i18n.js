import en from './i18n/en.js';
import de from './i18n/de.js';
import { getState, setData } from './store.js';

const locales = { en, de };

let current = locales[getState().locale] || locales.en;

const subscribers = new Set();

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function notify() {
  for (const fn of subscribers) {
    try { fn(current); } catch (e) { console.error('i18n subscriber error:', e); }
  }
}

export function setLocale(locale) {
  if (!locales[locale]) return;
  current = locales[locale];
  setData({ locale });
  document.documentElement.lang = current.lang;
  notify();
}

export function getLocale() {
  return current.locale;
}

export function getLang() {
  return current.lang;
}

export function t(key, params) {
  const parts = key.split('.');
  let val = current;
  for (const part of parts) {
    if (val == null || typeof val !== 'object') return key;
    val = val[part];
  }
  if (val == null) return key;
  if (typeof val === 'string') {
    if (params) {
      return val.replace(/\{(\w+)\}/g, (_, name) => {
        return params[name] != null ? params[name] : `{${name}}`;
      });
    }
    return val;
  }
  return key;
}
