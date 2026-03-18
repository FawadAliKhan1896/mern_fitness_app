# Fitness Tracker

A full-stack fitness tracking application to help users track workouts, nutrition, and progress over time. UI inspired by the [Samantha fitness theme](https://bslthemes.com/html/samantha/).

## Features

- **User Management**: Register, login, profile with JWT auth
- **Workout Tracking**: Create, edit, delete workouts with exercises (sets, reps, weight)
- **Nutrition Logging**: Log meals with calories and macros (protein, carbs, fat)
- **Progress Tracking**: Record weight, body measurements, run times, lifting stats
- **Dashboard**: Overview of recent activity
- **Analytics**: Charts for workout frequency, category breakdown, nutrition trends
- **Export**: Download reports as JSON or CSV
- **Settings**: Units, theme, notifications
- **Support**: Feedback form

## Tech Stack

- **Frontend**: React 19, Vite, React Router, Recharts
- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Auth**: JWT, bcrypt

## Setup

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm run init-db   # Create database
npm run dev       # Start API on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Start dev server on http://localhost:5173
```

The frontend proxies `/api` to the backend when running in dev.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/dashboard | Dashboard data |
| GET/POST | /api/workouts | List/create workouts |
| GET/PUT/DELETE | /api/workouts/:id | Workout CRUD |
| GET/POST | /api/nutrition | Nutrition logs |
| GET/POST | /api/progress | Progress entries |
| GET | /api/analytics/workouts | Workout analytics |
| GET | /api/analytics/nutrition | Nutrition analytics |
| GET | /api/export/report | Export report (JSON/CSV) |
| GET/PUT | /api/settings | User settings |

## Project Structure

```
Project/
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── middleware/auth.js
│   ├── routes/
│   └── scripts/initDb.js
├── frontend/
│   └── src/
│       ├── api/client.js
│       ├── components/
│       ├── context/
│       └── pages/
└── README.md
```
