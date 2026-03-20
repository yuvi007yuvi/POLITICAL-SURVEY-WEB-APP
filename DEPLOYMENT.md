# Deployment Guide: Political Soch Platform

Follow these steps to deploy the application to a production environment (e.g., Render, Railway, or a VPS).

## 1. Prerequisites
- **MongoDB Atlas**: Create a cluster and get your connection string.
- **Cloudinary Account**: Required for persistent profile photo storage (since local server storage is transient in cloud environments).

## 2. Environment Variables Configuration

### Backend (`server/.env`)
Set these variables in your deployment platform settings:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_complex_secret_key
CLIENT_URL=https://your-app-domain.com

# Cloudinary (Highly Recommend for Production)
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=/api
```
*(Note: Using `/api` works because the server is now configured to serve the frontend static files on the same domain).*

## 3. Build & Launch Instructions

### Phase 1: Frontend Build
1. Navigate to the `client` directory.
2. Run `npm install`.
3. Run `npm run build`.
This will generate the `client/dist` folder.

### Phase 2: Backend Finalization
1. Navigate to the `server` directory.
2. Run `npm install`.
3. Ensure `NODE_ENV` is set to `production`.

### Phase 3: Deployment Command
The main entry point for the entire application is now the server.
- **Command**: `npm start` (inside the `server` directory).
- **Behavior**: The server will serve the API on `/api` and the React frontend on all other routes.

## 4. Recommended Platforms

### Render (Fastest & Easiest)
1. **New Web Service**: Connect your GitHub repo.
2. **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
3. **Start Command**: `cd server && npm start`
4. **Environment Variables**: Add all variables from Step 2.

### VPS (Ubuntu/Nginx)
1. Clone the repo.
2. Run the build steps from Phase 1 & 2.
3. Use `pm2` to manage the server: `pm2 start server/server.js --name political-soch`.
4. Configure Nginx to proxy requests to `http://localhost:5000`.

---
*Note: Ensure your MongoDB Atlas IP Access List includes `0.0.0.0/0` or the specific IP of your deployment server.*
