# Aegyx Landing

Product landing page for Aegyx 0.1.

## Commands

```bash
npm install
npm run dev -- --port 5177
npm run preview -- --host 127.0.0.1 --port 5177
npm run build
npm audit --audit-level=high
```

## GitHub Pages

This project is ready for GitHub Pages deployment.

- `vite.config.js` uses `base: "./"` so built assets work from a Pages subpath.
- `public/.nojekyll` prevents GitHub Pages from filtering Vite assets.
- `.github/workflows/deploy-pages.yml` builds `dist/` and deploys it with GitHub Pages Actions.

Repository settings needed after push:

1. Open `Settings -> Pages`.
2. Set source to `GitHub Actions`.
3. Push to `main` or run the workflow manually.

## Design Direction

- Clean white product surface, not a generated sci-fi poster.
- Michroma wordmark treatment for AEGYX.
- Subtle site-wide canvas flow background kept as atmosphere only, not the hero object.
- Minimal first viewport: centered wordmark, short product statement, and one segmented glass dock.
- Runtime dock for Build together / Ask the repo / Hand off / Verify with uniform idle state and hover-only emphasis.
- Use cases use a cursor-reactive flowing field, not node/circle diagrams or Antigravity-style point clouds.
- Use-case sections focus on co-op coding, repo Q&A, impact simulation, onboarding, long handoffs, production feedback, and evidence boundaries.
- Product sections translate the master spec into public-safe outcomes: continuous engineering state, session continuity, impact maps, memory growth, privacy, and proof boundaries.
- Copy is kept landing-dense: short scan labels on the page, with detailed explanations intended for later linked pages.
- Product evidence sections use a bounded artifact ledger, not benchmark-scoreboard marketing.
