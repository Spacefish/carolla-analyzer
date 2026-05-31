import * as echarts from 'echarts';
import { getState } from '../store.js';
import { createStatsCard } from '../components/stats-card.js';

let chart = null;

export function render(container) {
  const state = getState();
  const { warnings } = state;

  container.innerHTML = `
    <div class="module-header">
      <h2>Warning Lights</h2>
    </div>
    <div class="stats-row" id="warnStats"></div>
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">Warning Timeline</div>
        <div id="warnChart" class="chart-container"></div>
      </div>
      <div class="card">
        <div class="card-header">Warning Details</div>
        <div id="warnTable"></div>
      </div>
    </div>
  `;

  const statsRow = document.getElementById('warnStats');
  createStatsCard(statsRow, 'Total Warnings', warnings.length, { color: '#ff9800' });

  if (warnings.length > 0) {
    const mileages = warnings.map(w => w.mileageValue).filter(m => m !== null);
    if (mileages.length > 0) {
      createStatsCard(statsRow, 'Mileage Range', `${Math.min(...mileages)} - ${Math.max(...mileages)} km`, { color: '#f44336' });
      createStatsCard(statsRow, 'Latest Warning', `${Math.max(...mileages)} km`, { color: '#e91e63' });
    }

    chart = echarts.init(document.getElementById('warnChart'), 'dark');
    chart.setOption({
      tooltip: {
        formatter(params) {
          const d = params[0];
          return `<b>${d.value[1]}</b><br/>Mileage: ${d.value[0]} km<br/>${d.name}`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: { type: 'value', name: 'Mileage (km)', axisLabel: { fontSize: 10 } },
      yAxis: { type: 'category', data: [''], show: false },
      series: [{
        type: 'scatter',
        data: warnings.map(w => [w.mileageValue || 0, 0, w.warningType]),
        symbolSize: 16,
        itemStyle: { color: '#ff9800' }
      }]
    });

    const tableContainer = document.getElementById('warnTable');
    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Mileage (km)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${warnings.map(w => `
          <tr>
            <td>${w.warningTimestamp ? w.warningTimestamp.slice(0, 16).replace('T', ' ') : '-'}</td>
            <td>${w.warningType}</td>
            <td>${w.mileageValue !== null ? w.mileageValue.toLocaleString() : '-'}</td>
            <td>${w.status ? 'Active' : 'Inactive'}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    tableContainer.appendChild(table);
  } else {
    document.getElementById('warnChart').innerHTML = '<p class="text-muted" style="padding:20px">No warning lights recorded</p>';
    document.getElementById('warnTable').innerHTML = '<p class="text-muted" style="padding:20px">No warning data available</p>';
  }

  window.addEventListener('resize', () => { if (chart) chart.resize(); });
}

export function destroy() {
  if (chart) {
    chart.dispose();
    chart = null;
  }
}
