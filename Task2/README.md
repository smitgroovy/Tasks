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
- **Workspaces** — Team collaboration with invite codes

### 🔐 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **super_admin** | Full system access, manage admin roles, delete users |
| **admin** | Access admin panel, manage users, view audit logs, CRUD all data |
| **editor** | Create and edit tasks, categories, tags. Cannot delete |
| **user** | View and complete own tasks. Read-only categories/tags |

### 🛡️ Authentication & Sessions

- JWT with refresh token rotation (15min access + 7d refresh)
- Auto-refresh on 401 via axios interceptor
- Password reset flow with secure tokens
- Rate limiting on auth routes (10 req/15min)
- Account activation/suspension by admins

### ⚙️ Admin Panel (`/admin`)

- **Dashboard** — System stats: total users, active users, role distribution, task counts
- **Users** — Paginated user list with search, role filter, inline editing, status toggle
- **Audit Logs** — Track all admin actions with timestamps, IP, and user agent
- **Settings** — System configuration (maintenance mode, site name — coming soon)

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access + refresh tokens) with role middleware
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

The first registered user gets the `user` role. Manually set to `super_admin` or `admin` in the database to access the admin panel.

```bash
# Promote yourself to admin (run in mongo shell or Compass)
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "super_admin" } })
```

## Project Structure

```
Task2/
  docs/           # Product docs, PRD, schema, API design, architecture
  server/         # Express + MongoDB backend
    src/
      config/     # DB, env, socket config
      middleware/  # Auth (JWT + RBAC), validation, error handling, rate limiting
      models/     # Mongoose schemas (User, Task, Category, Tag, Workspace, ActivityLog)
      routes/     # API routes (auth, admin, tasks, categories, tags, workspaces, dashboard)
      controllers/# Request handlers
      services/   # Business logic
      utils/      # Helpers
  client/         # React + Vite frontend
    src/
      components/ # Reusable components (ui, layout, tasks, auth, admin)
      pages/      # Route-level components (including auth pages + admin pages)
      context/    # React Context providers (Auth, Theme, Toast)
      services/   # API client with auto-refresh interceptor
      utils/      # Helpers
      styles/     # Global CSS + Tailwind
```

## API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/register` | Public |
| POST | `/login` | Public |
| POST | `/refresh` | Public |
| POST | `/logout` | Authenticated |
| GET | `/me` | Authenticated |
| POST | `/forgot-password` | Public |
| POST | `/reset-password` | Public |

### Admin (`/api/v1/admin`)
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/users` | admin, super_admin |
| GET | `/users/:id` | admin, super_admin |
| PATCH | `/users/:id/role` | super_admin |
| PATCH | `/users/:id/toggle-status` | admin, super_admin |
| PATCH | `/users/:id` | admin, super_admin |
| DELETE | `/users/:id` | super_admin |
| GET | `/stats` | admin, super_admin |
| GET | `/audit-logs` | admin, super_admin |

## Architecture

See `docs/05-ARCHITECTURE.md` for technical decisions and scalability notes.
