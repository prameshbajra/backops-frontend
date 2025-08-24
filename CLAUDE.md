# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode with development configuration
- `npm test` - Run unit tests with Karma/Jasmine

## Project Architecture

This is an Angular 19 application for file/image management with the following key architectural patterns:

### Core Structure
- **Standalone components**: Uses new Angular standalone component architecture
- **Signal-based state**: Uses Angular signals for reactive state management (e.g., `AuthService.currentUser`)
- **Interceptor chain**: HTTP requests flow through auth and response interceptors
- **Guard-protected routes**: All routes except login are protected by `authGuard`

### Key Services
- **AuthService** (`src/app/services/auth.service.ts`): Manages authentication with AWS Cognito, stores tokens in localStorage
- **FileService** (`src/app/services/file.service.ts`): Handles multipart file uploads to S3, file operations (delete, download), and coordinates with presigned URLs
- **DbService** (`src/app/services/db.service.ts`): Database operations and object listing with pagination

### File Management Flow
1. Files are uploaded in 5MB chunks using multipart upload to S3
2. EXIF metadata is extracted client-side using `exifr` library during upload
3. Images are grouped by date and displayed with infinite scroll pagination
4. Thumbnails are generated server-side and cached
5. Face detection and tagging capabilities are integrated

### Component Architecture
- **ObjectsComponent**: Main file listing with infinite scroll, bulk operations, and date-based grouping
- **ObjectViewerComponent**: Full-screen image viewer with face detection overlay
- **FileUploadComponent**: Drag-and-drop upload with progress tracking
- **Object-fab**: Floating action button for file operations

### State Management
- Uses BehaviorSubject pattern for cross-component communication
- File list updates are coordinated through `FileService.shouldUpdateObjectList`
- Filter state managed through `DbService.applyFilterObjectList`

### Environment Configuration
- API endpoints are configured in `src/environments/environment.ts`
- Uses separate authenticated (`AUTH_API_URL`) and unauthenticated (`UNAUTH_API_URL`) endpoints