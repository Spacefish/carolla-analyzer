# Commands

```sh
npm run dev      # Vite dev server on port 3000
npm run build    # production build to dist/
npm run preview  # preview production build
npx playwright test   # run tests (no npm test script)
```

# Architecture

- **SPA**: vanilla JS, no framework. Hash-based router in `src/router.js`.
- **Routes**: `upload`, `dashboard`, `trips`, `trips/:id`, `map`, `warnings`, `dict` — defined in `src/main.js`.
- **Parser pipeline**: `src/parser/` — CSV → trips, events, warnings, CAN dictionary lookup.
- **State**: `src/store.js` — simple pub/sub (`subscribe`, `setData`, `getState`).
- **Pages**: `src/modules/` — each exports `render(container, params)` and optionally `destroy()`.
- **Components**: `src/components/` — Leaflet map, ECharts charts, stats cards.
- **Entrypoint**: `index.html` → `src/main.js` → `src/app.js` shell.
- **CSS**: loaded via JS `import` in `main.js` (`src/styles/app.css`), dark automotive theme.

# Conventions

- Always commit and push changes after completing work.
- Vite `base: './'` for GitHub Pages — build paths are relative.
- No linter/formatter configured. No `npm test` script — use `npx playwright test` directly.
