# Product Requirements Document

## Feature Set — Prioritized

### P0: Core (Must Have)
| Feature | Description |
|---------|-------------|
| Auth | Email/password signup + login. JWT tokens (access + refresh). |
| Task CRUD | Create, read, update, delete tasks. Quick-add with title only, expand for details. |
| Priorities | 4 levels: Urgent, High, Medium, Low. Visual color coding. |
| Due dates | Date picker. Overdue highlighting. "Today", "This week", "Later" smart grouping. |
| Subtasks | Nest up to 2 levels. Progress bar on parent task. |
| Today view | Default landing. Shows tasks due today + overdue, sorted by priority. |
| Search | Full-text search across task titles and descriptions. Instant results. |

### P1: Organization (Should Have)
| Feature | Description |
|---------|-------------|
| Tags | User-defined tags with colors. Multi-tag per task. |
| Categories | Folders/lists for grouping tasks (e.g., "Work", "Personal", "Health"). |
| Filtering | By priority, tags, category, due date range, completion status. |
| Sorting | By due date, priority, created date, alphabetical. |
| Recurring tasks | Daily, weekly, monthly, custom. Auto-creates next instance on completion. |
| Bulk actions | Select multiple tasks to complete, move, delete, or tag. |

### P2: Intelligence (Nice to Have)
| Feature | Description |
|---------|-------------|
| Productivity dashboard | Tasks completed per day/week. Streak counter. Heatmap. |
| Smart suggestions | "You have 5 overdue tasks" / "Light day — 2 tasks due" |
| Natural language dates | "tomorrow", "next friday", "in 3 days" parsed on input. |

### P3: Collaboration (Future)
| Feature | Description |
|---------|-------------|
| Teams | Create workspaces. Invite members via email. |
| Shared tasks | Assign tasks to team members. See who's doing what. |
| Real-time sync | Socket.io for live updates across clients. |
| Activity feed | See team task completions and updates. |
| Notifications | Browser push notifications for due dates and assignments. |

## Views

### 1. Today (Default)
- Greeting based on time of day
- "Today" tasks sorted by priority
- Quick-add input at top
- Stats: "X of Y done today"

### 2. Upcoming
- Calendar-style or list grouped by date
- This week, next week, later

### 3. Categories/Lists
- Sidebar or tab navigation
- Each category shows task count

### 4. Search
- Full-text search bar
- Results with filters

### 5. Dashboard
- Weekly completion chart
- Current streak
- Tasks by priority breakdown
- Overdue count

### 6. Settings
- Profile
- Theme toggle
- Notification preferences

## Interactions
- **Add task**: Press Enter or click + button. Task appears with a subtle slide-in.
- **Complete task**: Click checkbox. Task fades out with a satisfying strikethrough animation.
- **Edit task**: Click task to expand inline. No modal needed.
- **Delete**: Swipe left on mobile, trash icon on desktop. Undo toast for 5 seconds.
- **Drag reorder**: Optional. Not critical for v1.

## Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | React + Vite | Fast dev, excellent ecosystem, Vite for instant HMR |
| Styling | Tailwind CSS | Rapid prototyping, consistent design tokens, small bundle |
| State management | React Context + useReducer | Sufficient for this scale, no extra dependency |
| Backend | Node.js + Express | JavaScript everywhere, fast for I/O-bound work |
| Database | MongoDB | Flexible schema for evolving task model, natural JSON |
| Auth | JWT (access + refresh) | Stateless, works with mobile clients, no session store |
| Real-time | Socket.io | Built-in fallback, rooms for team workspaces |
| Language | TypeScript | Catch bugs early, better DX, self-documenting |
| Date handling | date-fns | Lightweight, tree-shakeable, immutable |

## Non-Functional Requirements
- Lighthouse score > 90 on all categories
- First contentful paint < 1.5s
- API response time < 200ms for CRUD operations
- Support Chrome, Firefox, Safari, Edge (last 2 versions)
- Responsive: 320px to 2560px
- WCAG 2.1 AA compliance for accessibility
