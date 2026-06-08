# API Design

## Base URL
`/api/v1`

## Authentication
All routes except `/auth/*` require `Authorization: Bearer <accessToken>` header.

## Response Format
```json
{ "success": true, "data": { ... }, "message": "optional" }
```
Error:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Title is required" } }
```

---

## Auth Routes

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/register` | `{ name, email, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/auth/login` | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/auth/logout` | `{ refreshToken }` | `{ success }` |
| GET | `/auth/me` | - | `{ user }` |

## Task Routes

| Method | Endpoint | Query/Body | Response |
|--------|----------|------------|----------|
| GET | `/tasks` | `?status=&priority=&category=&tag=&search=&sort=` | `{ tasks, total, page, pages }` |
| GET | `/tasks/today` | - | `{ tasks }` |
| GET | `/tasks/upcoming` | `?days=7` | `{ tasks }` |
| GET | `/tasks/:id` | - | `{ task }` |
| POST | `/tasks` | `{ title, priority?, dueDate?, categoryId?, tags?, parentId?, recurrence? }` | `{ task }` |
| PATCH | `/tasks/:id` | `{ title?, priority?, status?, dueDate?, categoryId?, tags? }` | `{ task }` |
| DELETE | `/tasks/:id` | - | `{ success }` |
| POST | `/tasks/:id/complete` | - | `{ task, nextRecurring? }` |
| POST | `/tasks/bulk` | `{ ids, action, data? }` | `{ success, count }` |
| GET | `/tasks/:id/subtasks` | - | `{ subtasks }` |
| POST | `/tasks/:id/subtasks` | `{ title }` | `{ task }` |

## Category Routes

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/categories` | - | `{ categories }` |
| POST | `/categories` | `{ name, color?, icon? }` | `{ category }` |
| PATCH | `/categories/:id` | `{ name?, color?, icon?, order? }` | `{ category }` |
| DELETE | `/categories/:id` | - | `{ success }` |

## Tag Routes

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/tags` | - | `{ tags }` |
| POST | `/tags` | `{ name, color? }` | `{ tag }` |
| DELETE | `/tags/:id` | - | `{ success }` |

## Workspace Routes

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/workspaces` | - | `{ workspaces }` |
| POST | `/workspaces` | `{ name }` | `{ workspace }` |
| POST | `/workspaces/join` | `{ inviteCode }` | `{ workspace }` |
| GET | `/workspaces/:id/members` | - | `{ members }` |
| DELETE | `/workspaces/:id/members/:userId` | - | `{ success }` |

## Dashboard Routes

| Method | Endpoint | Query | Response |
|--------|----------|-------|----------|
| GET | `/dashboard/stats` | `?period=week` or `?period=month` | `{ completed, created, overdue, streak }` |
| GET | `/dashboard/activity` | `?days=7` | `{ activity[] }` |
| GET | `/dashboard/heatmap` | `?year=2026` | `{ data[] }` |

## Notification Routes

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/notifications` | - | `{ notifications }` |
| PATCH | `/notifications/:id/read` | - | `{ success }` |
| PUT | `/notifications/settings` | `{ dueDateReminder, dailyDigest, browserPush }` | `{ settings }` |

## Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `task:created` | server->client | `{ task }` | New task in workspace |
| `task:updated` | server->client | `{ task }` | Task modified |
| `task:completed` | server->client | `{ task }` | Task marked done |
| `task:deleted` | server->client | `{ taskId }` | Task removed |
| `member:joined` | server->client | `{ user, workspace }` | New member |
| `member:left` | server->client | `{ userId, workspace }` | Member removed |
| `join:workspace` | client->server | `{ workspaceId }` | Join room |
| `leave:workspace` | client->server | `{ workspaceId }` | Leave room |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | No permission |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate resource |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
