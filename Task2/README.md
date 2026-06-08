# Flowdo

A task management app that respects your time — fast capture, clear focus, real progress.

## Features

- **Quick task capture** — Add tasks in <2 seconds with keyboard shortcut
- **Today view** — Smart daily view with priority sorting and progress tracking
- **Upcoming** — Calendar-style upcoming tasks grouped by date
- **Dashboard** — Weekly completion stats, streak counter, activity chart
- **Categories** — Organize tasks with color-coded categories
- **Tags** — Multi-tag system for flexible labeling
- **Priorities** — 4-level priority system with visual coding
- **Due dates** — Smart date formatting, overdue highlighting
- **Subtasks** — Nested task support with progress tracking
- **Recurring tasks** — Auto-generate next tasks on completion
- **Search** — Full-text search across tasks
- **Dark/Light mode** — Premium themes, system preference detection
- **Responsive** — Mobile-first, exceptional desktop experience
- **Real-time** — Socket.io for live collaboration updates
- **Auth** — JWT with refresh token rotation
- **Workspaces** — Team collaboration with invite codes

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access + refresh tokens)
- **Real-time**: Socket.io
- **Validation**: Zod
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd server
cp .env.example .env  # Configure your env vars
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Project Structure

```
Task2/
  docs/           # Product docs, PRD, schema, API design, architecture
  server/         # Express + MongoDB backend
    src/
      config/     # DB, env, socket config
      middleware/  # Auth, validation, error handling, rate limiting
      models/     # Mongoose schemas
      routes/     # API routes
      controllers/# Request handlers
      services/   # Business logic
      utils/      # Helpers
  client/         # React + Vite frontend
    src/
      components/ # Reusable components (ui, layout, tasks, etc.)
      pages/      # Route-level components
      context/    # React Context providers
      services/   # API client
      utils/      # Helpers
      styles/     # Global CSS + Tailwind
```

## API Documentation

See `docs/04-API.md` for complete API reference.

## Architecture

See `docs/05-ARCHITECTURE.md` for technical decisions and scalability notes.
