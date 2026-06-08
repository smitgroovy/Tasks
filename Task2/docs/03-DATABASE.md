# Database Schema

## Entity Relationship

```
User 1──N Task
User 1──N Category
User 1──N Tag
User 1──N Workspace
Workspace 1──N Task
Task 1──N Task (subtasks, self-referencing)
Task N──N Tag
Task 1──N Reminder
```

## Collections

### users
```typescript
{
  _id: ObjectId,
  name: string,           // "Smit Patel"
  email: string,          // unique, indexed
  password: string,       // bcrypt hashed
  avatar: string,         // URL or null
  theme: "light" | "dark" | "system",
  timezone: string,       // "Asia/Kolkata"
  createdAt: Date,
  updatedAt: Date,
  refreshToken: string    // hashed, for refresh token rotation
}
```

### tasks
```typescript
{
  _id: ObjectId,
  userId: ObjectId,       // ref: users
  workspaceId: ObjectId,  // ref: workspaces, nullable (personal tasks)
  title: string,          // required, max 200 chars
  description: string,    // markdown supported, max 2000 chars
  priority: "urgent" | "high" | "medium" | "low",
  status: "todo" | "in_progress" | "done",
  dueDate: Date | null,
  completedAt: Date | null,
  parentId: ObjectId | null,  // ref: tasks (subtask)
  categoryId: ObjectId | null, // ref: categories
  tags: ObjectId[],       // ref: tags
  order: number,          // for manual sorting within a view
  
  // Recurring
  recurrence: {
    type: "none" | "daily" | "weekly" | "monthly" | "custom",
    interval: number,     // every N days/weeks/months
    daysOfWeek: number[], // [0-6] for weekly
    endDate: Date | null,
    lastGenerated: Date | null
  } | null,
  
  // Collaboration
  assigneeId: ObjectId | null, // ref: users
  createdBy: ObjectId,         // ref: users
  
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes
  // { userId: 1, dueDate: 1 }
  // { userId: 1, status: 1 }
  // { userId: 1, categoryId: 1 }
  // { workspaceId: 1 }
  // { parentId: 1 }
}
```

### categories
```typescript
{
  _id: ObjectId,
  userId: ObjectId,       // ref: users
  name: string,           // "Work", "Personal", "Health"
  color: string,          // hex color "#6366f1"
  icon: string,           // icon name "briefcase"
  order: number,          // for sorting
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes
  // { userId: 1 }
}
```

### tags
```typescript
{
  _id: ObjectId,
  userId: ObjectId,       // ref: users
  name: string,           // "urgent", "client-a", "learning"
  color: string,          // hex color
  createdAt: Date,
  
  // Indexes
  // { userId: 1, name: 1 } unique
}
```

### workspaces
```typescript
{
  _id: ObjectId,
  name: string,           // "Team Project"
  ownerId: ObjectId,      // ref: users
  members: [{
    userId: ObjectId,
    role: "owner" | "admin" | "member",
    joinedAt: Date
  }],
  inviteCode: string,     // unique, for joining
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes
  // { "members.userId": 1 }
}
```

### reminders
```typescript
{
  _id: ObjectId,
  taskId: ObjectId,       // ref: tasks
  userId: ObjectId,       // ref: users
  type: "due_date" | "custom",
  scheduledAt: Date,      // when to fire
  sent: boolean,
  createdAt: Date,
  
  // Indexes
  // { scheduledAt: 1, sent: 1 }
}
```

### activity_log
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  workspaceId: ObjectId,
  action: "task_created" | "task_completed" | "task_deleted" | "member_joined",
  taskId: ObjectId | null,
  metadata: object,       // flexible data
  createdAt: Date,
  
  // Indexes
  // { workspaceId: 1, createdAt: -1 }
  // { userId: 1, createdAt: -1 }
}
```

## Design Decisions

1. **Subtasks via self-reference**: A task's `parentId` points to its parent. Simple, no extra collection. Limited to 2 levels deep in application logic.

2. **Tags as separate collection**: Many-to-many relationship. Allows tag reuse, global rename, and color management without duplicating data across tasks.

3. **Categories per user**: Each user has their own category set. Shared workspaces inherit from workspace settings, not individual categories.

4. **Recurrence stored on task**: When a recurring task is completed, the system generates the next instance and updates `lastGenerated`. This avoids a separate "recurring rules" collection.

5. **Activity log for collaboration**: Append-only log. Keeps a history of team actions without cluttering the task document.

6. **Refresh token rotation**: Store hashed refresh token on user. On refresh, issue new pair and invalidate old. Prevents token reuse attacks.

7. **Compound indexes**: Designed for the most common query patterns — fetching today's tasks, filtering by category, and workspace queries.
