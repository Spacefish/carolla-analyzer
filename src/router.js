const routes = {};

let currentModule = null;

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
      return { module, params };
    }
  }

  return null;
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function init(container) {
  function handleHash() {
    if (currentModule && currentModule.destroy) {
      currentModule.destroy();
    }

    const match = matchRoute(window.location.hash);
    if (!match) {
      window.location.hash = '#upload';
      return;
    }

    currentModule = match.module;
    container.innerHTML = '';
    if (currentModule.render) {
      currentModule.render(container, match.params);
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}
