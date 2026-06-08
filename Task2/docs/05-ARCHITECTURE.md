# Architecture & Folder Structure

## Folder Structure

```
Task2/
  docs/
    01-VISION.md
    02-PRD.md
    03-DATABASE.md
    04-API.md
    05-ARCHITECTURE.md
  server/
    src/
      config/
        db.ts              # MongoDB connection
        env.ts             # Environment variable validation
        socket.ts          # Socket.io setup
      middleware/
        auth.ts            # JWT verification
        errorHandler.ts    # Global error handler
        validate.ts        # Request validation (zod)
        rateLimit.ts       # Rate limiting
      models/
        User.ts
        Task.ts
        Category.ts
        Tag.ts
        Workspace.ts
        Reminder.ts
        ActivityLog.ts
      routes/
        auth.routes.ts
        task.routes.ts
        category.routes.ts
        tag.routes.ts
        workspace.routes.ts
        dashboard.routes.ts
        notification.routes.ts
      controllers/
        auth.controller.ts
        task.controller.ts
        category.controller.ts
        tag.controller.ts
        workspace.controller.ts
        dashboard.controller.ts
        notification.controller.ts
      services/
        auth.service.ts         # Token generation, hashing
        task.service.ts         # Business logic
        recurrence.service.ts   # Recurring task generation
        notification.service.ts # Push notifications
      utils/
        AppError.ts
        catchAsync.ts
        dateHelpers.ts
        apiFeatures.ts          # Filtering, sorting, pagination
      socket/
        index.ts                # Socket connection handler
        workspace.handler.ts    # Workspace real-time events
      types/
        index.ts                # Shared TypeScript types
      app.ts                    # Express app setup
      server.ts                 # Entry point
    package.json
    tsconfig.json
    .env.example
  client/
    src/
      components/
        ui/
          Button.tsx
          Input.tsx
          Modal.tsx
          Badge.tsx
          Checkbox.tsx
          Dropdown.tsx
          Toast.tsx
          Spinner.tsx
        layout/
          AppLayout.tsx
          Sidebar.tsx
          Header.tsx
          MobileNav.tsx
        tasks/
          TaskCard.tsx
          TaskForm.tsx
          TaskList.tsx
          SubtaskList.tsx
          TaskFilters.tsx
          QuickAdd.tsx
          TaskDetail.tsx
        dashboard/
          StatsCard.tsx
          CompletionChart.tsx
          Heatmap.tsx
          StreakBadge.tsx
        categories/
          CategoryList.tsx
          CategoryForm.tsx
        tags/
          TagBadge.tsx
          TagPicker.tsx
        auth/
          LoginForm.tsx
          RegisterForm.tsx
        workspace/
          WorkspaceSwitcher.tsx
          MemberList.tsx
          InviteModal.tsx
      pages/
        LoginPage.tsx
        RegisterPage.tsx
        TodayPage.tsx
        UpcomingPage.tsx
        CategoryPage.tsx
        SearchPage.tsx
        DashboardPage.tsx
        SettingsPage.tsx
        WorkspacePage.tsx
      hooks/
        useTasks.ts
        useAuth.ts
        useCategories.ts
        useTags.ts
        useSocket.ts
        useTheme.ts
        useDebounce.ts
        useLocalStorage.ts
      context/
        AuthContext.tsx
        ThemeContext.tsx
        ToastContext.tsx
        SocketContext.tsx
      services/
        api.ts                # Axios instance
        auth.service.ts
        task.service.ts
        category.service.ts
        tag.service.ts
        workspace.service.ts
        dashboard.service.ts
      utils/
        dateHelpers.ts
        priorities.ts
        constants.ts
        cn.ts                 # clsx + tailwind-merge
      styles/
        globals.css           # Tailwind base + custom
      App.tsx
      main.tsx
    index.html
    package.json
    tsconfig.json
    tailwind.config.ts
    vite.config.ts
    .env.example
  .gitignore
  README.md
```

## Architecture Decisions

### 1. Monorepo without workspaces
**Decision**: Separate `server/` and `client/` directories, no monorepo tool.
**Tradeoff**: Could use Turborepo/Nx for shared types, but adds complexity. For this scale, separate packages with manual type sharing is sufficient. If the team grows, migrate to a monorepo tool.

### 2. MVC-like backend with services layer
**Decision**: Routes -> Controllers -> Services -> Models.
**Tradeoff**: Could use a repository pattern ( Controllers -> Repositories -> Models), but services are more flexible for business logic that spans multiple models. The extra abstraction of repositories isn't needed yet.

### 3. Context + useReducer over Redux
**Decision**: React Context for auth, theme, toasts, socket. useReducer for complex state.
**Tradeoff**: Redux Toolkit is more scalable for large apps, but adds bundle size and boilerplate. Context is sufficient for this app's state complexity. If performance issues arise from re-renders, we can optimize with context splitting or Zustand.

### 4. MongoDB over PostgreSQL
**Decision**: MongoDB for flexible schema.
**Tradeoff**: PostgreSQL offers better relational queries and ACID compliance. MongoDB wins here because:
- Task model evolves frequently (adding recurrence, collaboration features)
- Documents map naturally to JSON API responses
- Subtask nesting is simpler with embedded references
- Scale: MongoDB handles the read patterns well (most queries are by userId)

### 5. JWT with refresh token rotation
**Decision**: Short-lived access tokens (15min) + refresh tokens stored in httpOnly cookies.
**Tradeoff**: Could use session-based auth, but JWTs are stateless and work better with mobile clients. Refresh token rotation prevents token reuse. The downside is slightly more complex token management.

### 6. Socket.io over native WebSocket
**Decision**: Socket.io with fallback to long-polling.
**Tradeoff**: Raw WebSocket is lighter but lacks automatic reconnection, rooms, and fallback. Socket.io handles the collaboration features (workspace rooms) cleanly. The ~12KB gzipped overhead is acceptable.

### 7. Tailwind CSS over CSS modules or styled-components
**Decision**: Tailwind for styling.
**Tradeoff**: CSS modules offer better encapsulation. Styled-components add runtime overhead. Tailwind provides rapid development with consistent design tokens and small production bundle (purged). Tradeoff is verbose class names, mitigated by the `cn()` utility.

### 8. Zod for validation
**Decision**: Zod for request validation on backend, shared schemas.
**Tradeoff**: Could use Joi or express-validator. Zod provides TypeScript-first validation with excellent inference. Schemas can be shared between frontend and backend.

## Scalability Considerations

### Database
- **Indexing strategy**: Compound indexes on common query patterns (userId + status, userId + dueDate)
- **Connection pooling**: Mongoose default (10 connections) is sufficient for moderate traffic
- **Sharding**: If a user has 100K+ tasks, consider shard key on userId
- **Query optimization**: Use `.select()` to avoid fetching unnecessary fields, `.lean()` for read-only queries

### Backend
- **Rate limiting**: 100 requests per 15 minutes per IP for auth, 200 for API
- **Pagination**: Cursor-based pagination for task lists (more efficient than offset for large datasets)
- **Caching**: Redis for dashboard stats (expensive aggregation queries)
- **Horizontal scaling**: Stateless API behind load balancer, Socket.io with Redis adapter

### Frontend
- **Code splitting**: Route-based lazy loading (Today, Upcoming, Dashboard are separate chunks)
- **Virtualization**: For task lists > 100 items, use react-window
- **Optimistic updates**: Complete/delete tasks optimistically, rollback on error
- **Service worker**: Cache static assets for offline-first experience (future)

### Real-time
- **Socket.io rooms**: One room per workspace, avoid broadcasting to all users
- **Event throttling**: Debounce rapid updates (e.g., dragging tasks)
- **Fallback**: HTTP polling if WebSocket connection fails
