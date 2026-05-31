import { parseZipFile } from '../parser/parser.js';
import { setData } from '../store.js';
import { navigate } from '../router.js';
import { t } from '../i18n.js';

let currentContainer = null;

export function render(container) {
  currentContainer = container;
  container.innerHTML = `
    <div class="upload-container">
      <div class="upload-card">
        <div class="upload-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h2>${t('upload.title')}</h2>
        <p class="upload-subtitle">${t('upload.subtitle')}</p>
        <div class="upload-dropzone" id="dropzone">
          <span>${t('upload.dropzone')}</span>
        </div>
        <div class="upload-progress" id="uploadProgress" style="display:none">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="progress-text" id="progressText">${t('upload.processing')}</div>
        </div>
        <div class="upload-error" id="uploadError" style="display:none"></div>
      </div>
    </div>
  `;

  const dropzone = document.getElementById('dropzone');
  const progress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const errorEl = document.getElementById('uploadError');

  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      showError(t('upload.selectZip'));
      return;
    }

    dropzone.style.display = 'none';
    progress.style.display = 'block';
    errorEl.style.display = 'none';

    parseZipFile(file, (processed, total) => {
      const pct = Math.round((processed / total) * 100);
      progressFill.style.width = `${pct}%`;
      progressText.textContent = `Processing ${processed}/${total} files...`;
    }).then(result => {
      progressFill.style.width = '100%';
      progressText.textContent = t('upload.done');
      setData(result);
      navigate('#dashboard');
    }).catch(err => {
      showError(`${t('upload.failedPrefix')} ${err.message}`);
      progress.style.display = 'none';
      dropzone.style.display = 'block';
    });
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  dropzone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = () => {
      if (input.files[0]) handleFile(input.files[0]);
    };
    input.click();
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
}

export function destroy() {
  currentContainer = null;
}
