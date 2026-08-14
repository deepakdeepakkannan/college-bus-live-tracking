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
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Notes
- The app uses seeded in-memory data when no MongoDB URI is configured.
- To enable persistent storage, set MONGO_URI in the backend environment.
