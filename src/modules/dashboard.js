import * as echarts from 'echarts';
import { getState } from '../store.js';
import { createStatsCard } from '../components/stats-card.js';
import { navigate } from '../router.js';
import { formatDuration, formatLPer100km } from '../utils/format.js';
import { t, getLocale } from '../i18n.js';

let charts = [];
let consChart = null;
let currentGroup = 'day';

function disposeCharts() {
  for (const c of charts) {
    try { c.dispose(); } catch {}
  }
  charts = [];
  consChart = null;
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return `${d.getFullYear()}-W${String(1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)).padStart(2, '0')}`;
}

function groupTrips(trips, mode) {
  const groups = {};

  for (const trip of trips) {
    if (trip.distanceKm <= 0 || !trip.startTime) continue;
    const d = new Date(trip.startTime);
    if (isNaN(d.getTime())) continue;

    let key;
    if (mode === 'day') {
      key = trip.startTime.slice(0, 10);
    } else if (mode === 'week') {
      key = getWeekNumber(d);
    } else {
      key = trip.startTime.slice(0, 7);
    }

    if (!groups[key]) groups[key] = { fuelSum: 0, distSum: 0, count: 0 };
    groups[key].fuelSum += trip.fuelL;
    groups[key].distSum += trip.distanceKm;
    groups[key].count++;
  }

  const sorted = Object.keys(groups).sort();
  return sorted.map(k => {
    const g = groups[k];
    return {
      period: k,
      weightedLPer100km: g.distSum > 0 ? (g.fuelSum / (g.distSum / 100)) : 0,
      totalFuel: g.fuelSum,
      totalDist: g.distSum,
      tripCount: g.count
    };
  });
}

function buildConsChart(container, trips, groupMode) {
  if (consChart) {
    consChart.dispose();
    charts = charts.filter(c => c !== consChart);
  }

  const data = groupTrips(trips, groupMode);
  if (data.length === 0) return;

  consChart = echarts.init(container, 'dark');
  charts.push(consChart);

  const periods = data.map(d => d.period);
  const values = data.map(d => +d.weightedLPer100km.toFixed(1));
  const colors = values.map(v => v > 10 ? '#f44336' : v > 7 ? '#ff9800' : '#4caf50');

  consChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter(params) {
        const p = params[0];
        const d = data[p.dataIndex];
        return `<b>${d.period}</b><br/>
          ${t('dashboard.consumption')}: <b>${d.weightedLPer100km.toFixed(1)} L/100km</b><br/>
          ${t('dashboard.distance')}: ${d.totalDist.toFixed(0)} km<br/>
          ${t('dashboard.fuel')}: ${d.totalFuel.toFixed(2)} L<br/>
          ${t('dashboard.trips')}: ${d.tripCount}`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: periods,
      axisLabel: { rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'L/100km',
      axisLabel: { fontSize: 10, formatter: '{value}' },
      min: 0
    },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({
        value: v,
        itemStyle: { color: colors[i] }
      })),
      barMaxWidth: 40
    }]
  });
}

export function render(container) {
  const state = getState();
  const { trips, warnings } = state;

  container.innerHTML = `
    <div class="module-header">
      <h2>${t('dashboard.title')}</h2>
    </div>
    <div class="stats-row" id="statsRow"></div>
    <div class="dashboard-grid-cons">
      <div class="card">
        <div class="card-header">
          <span>${t('dashboard.fuelOverTime')}</span>
          <div class="chart-controls">
            <button class="btn chart-btn ${currentGroup === 'day' ? 'btn-active' : ''}" data-group="day">${t('dashboard.day')}</button>
            <button class="btn chart-btn ${currentGroup === 'week' ? 'btn-active' : ''}" data-group="week">${t('dashboard.week')}</button>
            <button class="btn chart-btn ${currentGroup === 'month' ? 'btn-active' : ''}" data-group="month">${t('dashboard.month')}</button>
          </div>
        </div>
        <div id="consChart" class="chart-container"></div>
      </div>
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">${t('dashboard.dailyDistance')}</div>
          <div id="dailyChart" class="chart-container"></div>
        </div>
        <div class="card">
          <div class="card-header">${t('dashboard.topLongest')}</div>
          <div id="topTrips" class="top-trips-list"></div>
        </div>
        <div class="card">
          <div class="card-header">${t('dashboard.fuelVsDistance')}</div>
          <div id="fuelChart" class="chart-container"></div>
        </div>
        <div class="card">
          <div class="card-header">${t('dashboard.warningLights')}</div>
          <div id="warningSummary" class="warning-summary"></div>
        </div>
      </div>
    </div>
  `;

  const statsRow = document.getElementById('statsRow');

  let totalKm = 0, totalFuel = 0;
  let minDate = null, maxDate = null;

  for (const trip of trips) {
    totalKm += trip.distanceKm;
    totalFuel += trip.fuelL;
    if (trip.startTime) {
      const d = new Date(trip.startTime);
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    }
  }

  const avgConsumption = totalKm > 0 ? (totalFuel / (totalKm / 100)) : 0;

  createStatsCard(statsRow, t('dashboard.totalTrips'), trips.length, { color: '#4fc3f7' });
  createStatsCard(statsRow, t('dashboard.totalDistance'), `${totalKm.toFixed(0)} km`, { color: '#4caf50' });
  createStatsCard(statsRow, t('dashboard.totalFuel'), `${totalFuel.toFixed(1)} L`, { color: '#ff9800' });
  createStatsCard(statsRow, t('dashboard.avgConsumption'), formatLPer100km(avgConsumption), { color: '#e91e63' });

  if (minDate && maxDate) {
    const dateRange = `${minDate.toLocaleDateString(getLocale())} - ${maxDate.toLocaleDateString(getLocale())}`;
    createStatsCard(statsRow, t('dashboard.dateRange'), dateRange, { color: '#9c27b0' });
  }

  buildConsChart(document.getElementById('consChart'), trips, currentGroup);

  document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentGroup = btn.dataset.group;
      document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('btn-active'));
      btn.classList.add('btn-active');
      buildConsChart(document.getElementById('consChart'), trips, currentGroup);
    });
  });

  const dailyData = {};
  for (const trip of trips) {
    if (trip.startTime) {
      const day = trip.startTime.split('T')[0];
      if (!dailyData[day]) dailyData[day] = 0;
      dailyData[day] += trip.distanceKm;
    }
  }

  const sortedDays = Object.keys(dailyData).sort();
  const dailyChart = echarts.init(document.getElementById('dailyChart'), 'dark');
  charts.push(dailyChart);
  dailyChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sortedDays.map(d => d.slice(5)),
      axisLabel: { rotate: 45, fontSize: 10 }
    },
    yAxis: { type: 'value', name: 'km', axisLabel: { fontSize: 10 } },
    series: [{
      type: 'bar',
      data: sortedDays.map(d => +dailyData[d].toFixed(1)),
      itemStyle: { color: '#4fc3f7' }
    }]
  });

  const fuelChart = echarts.init(document.getElementById('fuelChart'), 'dark');
  charts.push(fuelChart);
  const fuelScatterData = trips.map(t => [
    t.distanceKm,
    t.fuelL,
    t.startTime ? t.startTime.slice(0, 10) : ''
  ]).filter(d => d[0] > 0 && d[1] > 0);

  fuelChart.setOption({
    tooltip: {
      formatter(params) {
        const d = params[0];
        return `Distance: ${d.value[0]} km<br/>Fuel: ${d.value[1]} L<br/>Date: ${d.value[2]}`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: { type: 'value', name: 'Distance (km)', axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', name: 'Fuel (L)', axisLabel: { fontSize: 10 } },
    series: [{
      type: 'scatter',
      data: fuelScatterData,
      symbolSize: 8,
      itemStyle: { color: '#ff9800' }
    }]
  });

  const topTrips = [...trips].sort((a, b) => b.distanceKm - a.distanceKm).slice(0, 5);
  const topList = document.getElementById('topTrips');
  for (const trip of topTrips) {
    const item = document.createElement('div');
    item.className = 'top-trip-item';
    item.innerHTML = `
      <span class="top-trip-date">${trip.startTime ? trip.startTime.slice(0, 10) : '-'}</span>
      <span class="top-trip-dist">${trip.distanceKm.toFixed(1)} km</span>
      <span class="top-trip-duration">${formatDuration(trip.durationSeconds)}</span>
    `;
    item.addEventListener('click', () => navigate(`#trips/${trip.index}`));
    topList.appendChild(item);
  }

  const warnSummary = document.getElementById('warningSummary');
  if (warnings.length > 0) {
    warnSummary.innerHTML = `
      <p>${t('dashboard.warningsRecorded', { count: warnings.length })}</p>
      <p>${t('dashboard.warningType')}: ${warnings.map(w => w.warningType).filter(Boolean).join(', ') || 'N/A'}</p>
      <button class="btn btn-small" onclick="location.hash='#warnings'">${t('dashboard.viewDetails')}</button>
    `;
  } else {
    warnSummary.innerHTML = `<p class="text-muted">${t('dashboard.noWarnings')}</p>`;
  }

  window.addEventListener('resize', () => {
    for (const c of charts) { try { c.resize(); } catch {} }
  });
}

export function destroy() {
  disposeCharts();
}
