import { getState } from '../store.js';

let currentTab = 'can';

export function render(container) {
  const state = getState();

  container.innerHTML = `
    <div class="module-header">
      <h2>Data Dictionary</h2>
      <div class="dict-tabs">
        <button class="btn ${currentTab === 'can' ? 'btn-active' : ''}" id="tabCan">CAN Data</button>
        <button class="btn ${currentTab === 'op' ? 'btn-active' : ''}" id="tabOp">Operation Data</button>
      </div>
    </div>
    <div class="card">
      <input type="text" class="search-input" id="dictSearch" placeholder="Search by ID or description..." />
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table class="data-table" id="dictTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Units</th>
            </tr>
          </thead>
          <tbody id="dictTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  renderTable(state);

  document.getElementById('tabCan').addEventListener('click', () => {
    currentTab = 'can';
    renderTable(state);
    document.getElementById('tabCan').classList.add('btn-active');
    document.getElementById('tabOp').classList.remove('btn-active');
  });

  document.getElementById('tabOp').addEventListener('click', () => {
    currentTab = 'op';
    renderTable(state);
    document.getElementById('tabOp').classList.add('btn-active');
    document.getElementById('tabCan').classList.remove('btn-active');
  });

  document.getElementById('dictSearch').addEventListener('input', () => {
    renderTable(state);
  });
}

function renderTable(state) {
  const dict = currentTab === 'can' ? state.canDict : state.opDict;
  const search = document.getElementById('dictSearch');
  const searchVal = search ? search.value.toLowerCase() : '';
  const tbody = document.getElementById('dictTableBody');
  if (!tbody) return;

  const entries = Object.values(dict).filter(e => {
    if (!searchVal) return true;
    return e.id.includes(searchVal) || e.description.toLowerCase().includes(searchVal);
  });

  entries.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

  tbody.innerHTML = entries.map(e => {
    let unitsStr = '-';
    if (e.units) {
      unitsStr = Object.keys(e.units).join(', ');
    }
    return `
      <tr>
        <td>${e.id}</td>
        <td>${e.description || '<span class="text-muted">(unnamed)</span>'}</td>
        <td>${unitsStr}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="3" class="text-muted">No entries found</td></tr>';
}

export function destroy() {
  currentTab = 'can';
}
