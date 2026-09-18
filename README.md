# College Bus Live Tracker System

A full-stack web application for live college bus tracking, student access, and transport management.

## Features
- Landing page with college information and transport metrics
- Bus search by bus number or route number
- Live tracking map with real-time GPS updates
- Admin, driver, and student dashboards
- REST API endpoints for buses, students, login, and GPS updates

## Project Structure
```text
backend/
  models/
  routes/
  package.json
  server.js
frontend/
  public/
  src/
    components/
    pages/
    App.js
    index.js
    index.css
  package.json
  tailwind.config.js
  postcss.config.js
README.md
```

## Setup
### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints
- GET /health
- GET /college
- GET /dashboard-summary
- POST /login
- GET /api/buses
- GET /api/bus/:busNumber
- GET /api/students
- POST /api/gps/update
- POST /api/addBus
- POST /api/addStudent

## Deployment Notes
- Frontend: deploy the `frontend/` folder as a Vercel project.
- Backend: deploy the `backend/` folder as a Render Web Service.
- Database: MongoDB Atlas, configured through `MONGODB_URI`.
- Frontend API URL: set `REACT_APP_BACKEND_URL` to the deployed backend URL before building.
- Live Socket.IO updates remain available for local development. Vercel's serverless functions do not provide a persistent WebSocket server, so production pages use REST data without a persistent socket connection.

### Render backend deployment
1. Create a Render **Web Service** connected to this repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install` and **Start Command** to `node server.js`.
4. Add `MONGO_URI` (your MongoDB Atlas connection string) and `FRONTEND_URL` (the final Vercel URL). Render provides `PORT` automatically; do not hard-code it.
5. Deploy and verify `https://your-backend.onrender.com/health` returns `{"status":"ok"}`.

### Vercel frontend deployment
1. Create a Vercel project connected to this repository.
2. Set **Root Directory** to `frontend`.
3. Select **Create React App** as the framework preset. Use `npm run build` as the build command and `build` as the output directory.
4. Add `REACT_APP_BACKEND_URL=https://your-backend.onrender.com` to the Production environment, then deploy or redeploy.
5. Copy the Vercel production URL into Render's `FRONTEND_URL` variable and redeploy the backend if needed.

For local development, copy the example environment files and set `REACT_APP_BACKEND_URL` to `http://localhost:5000`. Set `REACT_APP_ENABLE_LIVE_SOCKET=true` when testing local live tracking.

## Notes
- The app uses seeded in-memory data when no MongoDB URI is configured.
- To enable persistent storage, set `MONGODB_URI` in the backend environment. `MONGO_URI` remains supported for compatibility.
