# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BackOps Frontend is an Angular 19 photo management application backed by AWS services (S3, DynamoDB, Cognito, Rekognition). It provides a gallery view with face detection, album management, and direct S3 multipart uploads.

## Build & Development Commands

- `npm start` — dev server with HMR
- `npm run build` — production build (output: `dist/backop-frontend/browser`)
- `npm run watch` — continuous dev build
- `npm test` — run Karma + Jasmine unit tests
- No lint command is configured

## Architecture

**Standalone components only** — no NgModules. All components use `imports: []` directly.

**Routing** (`app.routes.ts`): Three routes — `''` (HomeComponent, guarded), `'login'` (LoginComponent), `'**'` (wildcard to HomeComponent, guarded). The `authGuard` is a functional `CanActivateFn` that checks an Angular signal.

**Authentication**: AWS Cognito via backend API proxy. Tokens (IdToken, AccessToken, RefreshToken) stored in `localStorage`. Two HTTP interceptors (both functional, not class-based):
- `authInterceptor` — attaches raw `accessToken` as `Authorization` header (excludes `/login` and S3 URLs)
- `responseInterceptor` — catches 401/403, clears auth state, redirects to `/login`

**Key Services**:
- `AuthService` — login/logout/getCurrentUser, holds `currentUser` as an Angular **signal**
- `FileService` — S3 multipart upload (5MB chunks, configurable concurrency via `environment.CONCURRENT_UPLOADS`), download with in-memory TTL cache for signed URLs, delete
- `DbService` — object list (paginated with DynamoDB `nextToken` cursor), face data CRUD (Rekognition), date filter broadcast via `Subject`
- `AlbumService` — album CRUD and file-to-album assignment

**State management**: No external store. Uses Angular signals (`currentUser`), RxJS `BehaviorSubject` (`shouldUpdateObjectList` for list refresh), and `Subject` (`timestampPrefixSub` for date filtering).

**API layer**: Two base URLs in `environment.ts` — `UNAUTH_API_URL` (sign-in only) and `AUTH_API_URL` (all authenticated calls). Both are AWS API Gateway endpoints (ap-south-1).

**UI**: Angular Material 19 (indigo-pink theme) + Tailwind CSS 3. Dialogs use a custom `glass-dialog-panel` CSS class for glassmorphism. Dark mode supported via `prefers-color-scheme`.

**Data model**: DynamoDB single-table design — `FileItem` has `PK`/`SK` fields. Files are grouped by day/month using `moment.js` in the gallery.

## Coding Conventions

- 2-space indentation, UTF-8, single quotes, strict TypeScript (see `tsconfig.json`)
- Kebab-case filenames (`file-upload.component.ts`), PascalCase class names
- Prefer Tailwind utility classes; keep component styles scoped
- Functional guards and interceptors (not class-based)
- Tests colocated as `*.spec.ts` next to source files

## Commit Style

Imperative mood with scope: `feat(objects): add EXIF preview to viewer`

## Deployment

CI/CD via GitHub Actions (`.github/workflows/buiild-and-deploy.yaml`): push to `main`/`master` triggers build and `aws s3 sync --delete` to `s3://backops-frontend`. Service worker enabled in production builds.
