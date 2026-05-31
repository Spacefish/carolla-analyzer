import { getLocale } from '../i18n.js';

export function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString(getLocale(), { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return isoStr;
  }
}

export function formatTime(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoStr;
  }
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString(getLocale(), {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return isoStr;
  }
}

export function formatKm(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value.toFixed(1)} km`;
}

export function formatFuel(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value.toFixed(2)} L`;
}

export function formatSpeed(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${Math.round(value)} km/h`;
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatLPer100km(value) {
  if (value === null || value === undefined || isNaN(value) || value === 0) return '-';
  return `${value.toFixed(1)} L/100km`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return value.toLocaleString(getLocale());
}
