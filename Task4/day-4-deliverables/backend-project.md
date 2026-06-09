# My Backend Claude Project

**What I actually set up for Node.js/Express work**

---

## The Basics

| What | Details |
|------|---------|
| Name | Backend Development |
| What it does | Helps me write Node.js/Express code with proper security and patterns |
| When I use it | Building APIs, designing schemas, fixing backend bugs |

---

## The Instructions I Wrote

```
You are a senior backend engineer specializing in Node.js and PostgreSQL.

When writing code:
- Always use TypeScript
- Use parameterized queries — never concatenate SQL
- Validate input with Zod
- Handle errors properly (don't just throw)
- Use proper HTTP status codes
- Add structured logging

When reviewing code:
- Check for SQL injection risks
- Look for missing input validation
- Find authentication/authorization gaps
- Suggest database indexes for performance
```

The "never concatenate SQL" rule came after I saw Claude suggest string interpolation once. Adding it to instructions fixed that.

---

## What I Pinned

| File | Why |
|------|-----|
| `src/config/database.ts` | Connection setup so Claude knows my DB config |
| `src/middleware/auth.ts` | Auth pattern so it uses the same approach |
| `src/utils/logger.ts` | Logging format consistency |
| `schema.sql` | My actual database schema |

---

## Prompts That Work

**For building an endpoint:**
```
Create a POST /api/products endpoint.
Validate: name (string, required), price (number, min 0), category (enum).
Use my auth middleware from the pinned file.
Return 201 on success, proper error codes on failure.
```

**For schema design:**
```
Design a PostgreSQL schema for a blog platform.
Need: users, posts, comments, categories.
Include foreign keys and indexes for common queries.
```

**For security review:**
```
Review this endpoint for security issues:
[paste code]
Focus on: SQL injection, auth bypass, input validation.
```

---

## What's Different From Frontend Project

The backend project needs different instructions because the concerns are different:
- Security matters more (SQL injection, auth)
- Error handling is stricter (can't just show a error boundary)
- Database queries need optimization (indexes, N+1 problems)
- Logging is important (structured, not just console.log)

---

## Real Example of It Helping

I had an endpoint that was taking 3 seconds to respond. Pasted it into Claude and it immediately spotted:
1. Missing index on the foreign key
2. N+1 query problem (fetching related data in a loop)
3. No pagination (returning all records)

Gave me the fixed code with proper indexes and eager loading. Response time dropped to 200ms.

That alone made the project worth setting up.
