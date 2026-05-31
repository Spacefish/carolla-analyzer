import * as echarts from 'echarts';
import { getState } from '../store.js';
import { createStatsCard } from '../components/stats-card.js';
import { navigate } from '../router.js';
import { formatDuration, formatLPer100km } from '../utils/format.js';

let charts = [];

function disposeCharts() {
  for (const c of charts) {
    try { c.dispose(); } catch {}
  }
  charts = [];
}

export function render(container) {
  const state = getState();
  const { trips, warnings } = state;

  container.innerHTML = `
    <div class="module-header">
      <h2>Dashboard</h2>
    </div>
    <div class="stats-row" id="statsRow"></div>
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">Daily Distance</div>
        <div id="dailyChart" class="chart-container"></div>
      </div>
      <div class="card">
        <div class="card-header">Fuel Consumption</div>
        <div id="fuelChart" class="chart-container"></div>
      </div>
      <div class="card">
        <div class="card-header">Top 5 Longest Trips</div>
        <div id="topTrips" class="top-trips-list"></div>
      </div>
      <div class="card">
        <div class="card-header">Warning Lights</div>
        <div id="warningSummary" class="warning-summary"></div>
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

  createStatsCard(statsRow, 'Total Trips', trips.length, { color: '#4fc3f7' });
  createStatsCard(statsRow, 'Total Distance', `${totalKm.toFixed(0)} km`, { color: '#4caf50' });
  createStatsCard(statsRow, 'Total Fuel', `${totalFuel.toFixed(1)} L`, { color: '#ff9800' });
  createStatsCard(statsRow, 'Avg Consumption', formatLPer100km(avgConsumption), { color: '#e91e63' });

  if (minDate && maxDate) {
    const dateRange = `${minDate.toLocaleDateString('en-GB')} - ${maxDate.toLocaleDateString('en-GB')}`;
    createStatsCard(statsRow, 'Date Range', dateRange, { color: '#9c27b0' });
  }

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
      <p><strong>${warnings.length}</strong> warning(s) recorded</p>
      <p>Type: ${warnings.map(w => w.warningType).filter(Boolean).join(', ') || 'N/A'}</p>
      <button class="btn btn-small" onclick="location.hash='#warnings'">View Details</button>
    `;
  } else {
    warnSummary.innerHTML = '<p class="text-muted">No warning lights recorded</p>';
  }

  window.addEventListener('resize', () => {
    for (const c of charts) { try { c.resize(); } catch {} }
  });
}

export function destroy() {
  disposeCharts();
}
