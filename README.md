# Political Soch

Political Soch is a free-tier survey platform architecture for field operations, combining:

- `server/`: Node.js + Express MVC API
- `client/`: React + Vite admin dashboard
- `mobile/`: React Native Expo survey app

## Architecture

### Backend

- Express MVC with controllers, models, routes, middleware, config, utils
- MongoDB Atlas free tier for transactional survey storage
- Cloudinary free tier for photo and voice evidence
- JWT + bcrypt authentication
- Async error handling, zod validation, rate limiting, Helmet, CORS

### Admin Dashboard

- React + Vite
- Tailwind CSS
- React Query for caching and request deduplication
- Leaflet + OpenStreetMap for map tracking
- Excel/PDF export from reports

### Mobile

- Expo managed workflow to avoid native build complexity
- Dynamic survey rendering from backend `formDefinition`
- Camera capture with compression
- Voice recording
- GPS capture
- Offline queue with later sync

## Database Schema

### User

- `name`
- `email`
- `password`
- `role`
- `assignedProjects`
- `phone`
- `isActive`
- `lastLoginAt`

### Project

- `name`
- `code`
- `description`
- `status`
- `createdBy`
- `assignedUsers`
- `formDefinition[]`

### Survey

- `userId`
- `projectId`
- `answers[]`
- `gpsLocation`
- `photos[]`
- `voiceRecording`
- `submittedAt`
- `offlineReferenceId`

## Environment Setup

### Backend

1. Copy the example env file from `server/.env.example` to `server/.env`.
2. Add MongoDB Atlas, JWT, and Cloudinary credentials.
3. Run `npm install` inside `server`.
4. Run `npm run dev`.

### Admin Dashboard

1. Copy the example env file from `client/.env.example` to `client/.env`.
2. Set `VITE_API_BASE_URL`.
3. Run `npm install` inside `client`.
4. Run `npm run dev`.

### Mobile

1. Copy the example env file from `mobile/.env.example` to `mobile/.env`.
2. Set `EXPO_PUBLIC_API_BASE_URL`.
3. Run `npm install` inside `mobile`.
4. Run `npx expo start`.

## Deployment Steps

### MongoDB Atlas Free

1. Create one free cluster.
2. Create a database user and IP allowlist.
3. Use the connection string in backend env.

### Cloudinary Free

1. Create one free account.
2. Copy cloud name, API key, and secret.
3. Add them to backend env.

### Render Free

1. Create a new web service from `server/`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all backend environment variables.

### Netlify Free

1. Create a site from `client/`.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `VITE_API_BASE_URL`.

### Expo

1. Run the mobile app in Expo Go for testing.
2. For production APK/AAB, use EAS build from `mobile/`.
3. See `mobile/BUILD_ANDROID.md` for the Android release flow.

## Free Cost Optimization Strategy

- Compress images on-device before upload to reduce Cloudinary usage.
- Use one MongoDB cluster for all environments initially, separated by database names.
- Cache dashboard queries with React Query to reduce repeat admin requests.
- Paginate reports and users to avoid loading heavy datasets.
- Use Render free instance only for the API and Netlify free for static hosting.
- Store media in Cloudinary instead of MongoDB to keep Atlas usage low.
- Queue failed mobile submissions offline instead of retrying aggressively.

## Security Best Practices

- Store JWT secret only in environment variables.
- Hash passwords with bcrypt before persistence.
- Enforce role-based authorization on admin APIs.
- Rate-limit auth and public API traffic.
- Validate incoming payloads with zod.
- Use Helmet, CORS, and centralized error handling.
- Never expose Cloudinary secrets in web or mobile apps.
- Add audit logging for sensitive admin actions in the next iteration.

## Future Scalability Plan

- Split auth, project, and survey domains into separate services when traffic grows.
- Introduce Redis for queueing, caching, and sync retry orchestration.
- Move report generation to background jobs.
- Add S3-compatible storage if Cloudinary limits become restrictive.
- Add websocket or polling-based live dashboard updates.
- Add form versioning so old surveys remain schema-safe after project edits.
- Add tenant isolation if the platform becomes multi-organization.
