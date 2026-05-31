import { getState } from './store.js';

const routes = {};

let currentModule = null;
let currentRouteParams = {};
let containerRef = null;

export function route(pattern, module) {
  routes[pattern] = module;
}

function matchRoute(hash) {
  const path = hash.replace(/^#/, '') || 'upload';

  for (const [pattern, module] of Object.entries(routes)) {
    const regex = new RegExp(`^${pattern.replace(/:\w+/g, '([^/]+)')}$`);
    const match = path.match(regex);
    if (match) {
      const params = {};
      const paramNames = [...pattern.matchAll(/:(\w+)/g)].map(m => m[1]);
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return { pattern, module, params };
    }
  }

  return null;
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function init(container) {
  containerRef = container;

  function handleHash() {
    if (currentModule && currentModule.destroy) {
      currentModule.destroy();
    }

    const match = matchRoute(window.location.hash);
    if (!match) {
      window.location.hash = '#upload';
      return;
    }

    if (!getState().loaded && match.pattern !== 'upload') {
      window.location.hash = '#upload';
      return;
    }

    currentModule = match.module;
    currentRouteParams = match.params;
    container.innerHTML = '';
    if (currentModule.render) {
      currentModule.render(container, match.params);
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}

export function reRender() {
  if (!currentModule || !containerRef) return;
  if (currentModule.destroy) {
    currentModule.destroy();
  }
  containerRef.innerHTML = '';
  if (currentModule.render) {
    currentModule.render(containerRef, currentRouteParams);
  }
}
