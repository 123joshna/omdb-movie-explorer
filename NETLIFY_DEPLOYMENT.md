# Netlify Deployment Guide

This guide explains how to deploy the OMDB Movie Explorer frontend to Netlify and configure it to communicate with your backend.

## Prerequisites
- Frontend built (`npm run build` in `frontend/`)
- Backend deployed (e.g., Heroku, Railway, Render, or your own server)
- Netlify account

## Steps

### 1. Deploy the Backend
Deploy your Node.js backend to a service like:
- **Render** (free tier available): https://render.com
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com
- **Your own VPS/server**

Note the deployed backend URL (e.g., `https://your-backend.onrender.com`)

### 2. Set Frontend Environment Variable
Create a `.env.production` file in the `frontend/` folder:
```
VITE_API_BASE_URL=https://your-backend.onrender.com
```
Replace `https://your-backend.onrender.com` with your actual backend URL.

### 3. Build the Frontend
```powershell
cd frontend
npm install
npm run build
```
This generates a `dist/` folder with the production build.

### 4. Deploy to Netlify

**Option A: Using Netlify CLI**
```powershell
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=dist
```

**Option B: Using Netlify Web UI**
1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `frontend/dist` folder
4. Once deployed, set environment variable in Netlify UI:
   - Go to Site settings → Environment
   - Add `VITE_API_BASE_URL` with your backend URL
   - Trigger a new deploy

**Option C: Connect Git Repository**
1. Push your code to GitHub (if not already)
2. On Netlify, click "Add new site" → "Import from existing project"
3. Connect your GitHub account
4. Select the repository
5. Set build command: `cd frontend && npm run build`
6. Set publish directory: `frontend/dist`
7. In Site settings → Environment, add the `VITE_API_BASE_URL` variable
8. Netlify auto-deploys on push

### 5. Configure Backend for CORS (if needed)
If your backend isn't already configured for CORS, add it in `backend/server.js`:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### 6. Test
- Open your Netlify site URL
- Try searching for a movie
- Add a movie to favorites
- Verify the centered alert appears
- Check browser DevTools Console for any CORS or fetch errors

## Troubleshooting

### "Fetch failed" or "Failed to fetch"
- Check the backend URL in `VITE_API_BASE_URL` is correct and reachable
- Verify backend CORS settings allow requests from your Netlify domain
- Check browser Console (DevTools) for the actual error

### Localhost API calls in production
- Ensure you rebuild with `.env.production` set
- On Netlify, rebuild after setting environment variables (or use "Trigger deploy" button)
- Clear browser cache (or hard refresh: Ctrl+Shift+R or Cmd+Shift+R)

### Backend URL changes
- Update `VITE_API_BASE_URL` in Netlify Site settings → Environment
- Trigger a new deploy from Netlify UI

## Development
For local development, the Vite dev server proxy (`vite.config.js`) automatically routes `/api` to `http://localhost:4000`, so you don't need the `VITE_API_BASE_URL` set locally.

```powershell
# Terminal 1 (backend)
cd backend
npm run dev

# Terminal 2 (frontend)
cd frontend
npm run dev
```
