export function createStatsCard(container, label, value, opts = {}) {
  const card = document.createElement('div');
  card.className = 'stats-card';
  if (opts.color) {
    card.style.borderLeftColor = opts.color;
  }

  const valueEl = document.createElement('div');
  valueEl.className = 'stats-card-value';
  valueEl.textContent = value !== null && value !== undefined ? value : '-';

  const labelEl = document.createElement('div');
  labelEl.className = 'stats-card-label';
  labelEl.textContent = label;

  card.appendChild(valueEl);
  card.appendChild(labelEl);
  container.appendChild(card);
  return card;
}
