# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Angular feature modules, components, services, pipes, guards, interceptors (e.g., `components/*`, `services/*`).
- `src/assets`: Static assets. `public/` for public files referenced at build.
- `src/environments`: Environment configs (e.g., `environment.ts`). Do not hardcode secrets.
- `angular.json`: Build/serve/test targets. Output to `dist/backop-frontend` (browser bundle under `dist/backop-frontend/browser`).

## Build, Test, and Development Commands
- `npm start`: Run dev server on the default Angular port with HMR.
- `npm run build`: Production build. Artifacts in `dist/backop-frontend/browser`.
- `npm run watch`: Continuous development build.
- `npm test`: Run Karma + Jasmine unit tests.
- CI deploy (GitHub Actions): pushes to `main`/`master` build and sync to S3 (`.github/workflows/buiild-and-deploy.yaml`).

## Coding Style & Naming Conventions
- Indentation: 2 spaces; UTF‑8; trim trailing whitespace (`.editorconfig`).
- TypeScript: single quotes (`.editorconfig`), strict typing preferred; avoid `any`.
- Angular: use PascalCase for Components/Services classes; kebab-case filenames, e.g., `file-upload.component.ts`.
- Styles: Tailwind (`src/styles.css`) + Angular Material theme. Prefer utility classes; keep component styles scoped.

## Testing Guidelines
- Framework: Karma + Jasmine.
- Location: colocate tests as `*.spec.ts` next to source, e.g., `file-upload.component.spec.ts`.
- Scope: favor shallow tests for components and focused unit tests for services/pipes; mock HTTP and timers.
- Run: `npm test`. Keep tests deterministic; avoid real network/filesystem.

## Commit & Pull Request Guidelines
- Commits: imperative mood, concise scope. Example: `feat(objects): add EXIF preview to viewer`.
- Include context in body: problem, approach, notable trade-offs.
- PRs: provide description, linked issues, screenshots for UI changes, and test notes. Ensure `npm test` and `npm run build` pass.

## Security & Configuration Tips
- Configure runtime endpoints in `src/environments/*.ts`; never commit credentials. Use GitHub Secrets for AWS keys.
- Service worker enabled in production (`ngsw-config.json`); verify caching on deploys.
- S3 deploys sync `dist/backop-frontend/browser` to the bucket; clear invalidated assets via cache-busting (output hashing is enabled).
