# Prompt Style Comparison

**Date:** June 9, 2026
**Task:** Build a Todo Application using 5 different prompting styles.

---

## Style 1: Zero-shot

**Prompt:**
```
Build a Todo application.
```

**Output Summary:**
Got a basic HTML/JS file. Single page, inline styles, add/delete only. No framework, no database. Works but barely.

**Strengths:**
- Fast response
- No setup required
- Good for quick ideas

**Weaknesses:**
- Generic output
- No tech stack specified
- Not production-ready
- Had to re-prompt 3-4 times to get something useful

---

## Style 2: Role-based

**Prompt:**
```
You are a senior full-stack engineer. Build a Todo application with React, Node.js, and MongoDB. Include authentication, CRUD operations, and a clean UI.
```

**Output Summary:**
Much better. Got a proper MERN stack app with folder structure, auth routes, and React components. Code followed best practices.

**Strengths:**
- Expert-level code quality
- Proper architecture decisions
- Security considerations included

**Weaknesses:**
- Assumed tech stack without asking
- Some over-engineering for a simple todo
- Long response time

---

## Style 3: Chain-of-thought

**Prompt:**
```
Build a Todo application. Think through this step by step:
1. What features do we need?
2. What's the data model?
3. What API routes are required?
4. What components do we need?
5. How do we handle state?
Then implement the complete application.
```

**Output Summary:**
Got a detailed plan first, then the implementation. The thinking process was visible and logical. Final code was well-structured.

**Strengths:**
- Clear reasoning process
- Well-organized output
- Easy to follow the logic
- Caught edge cases during planning

**Weaknesses:**
- Longer response
- Planning section was verbose
- Some redundancy between plan and code

---

## Style 4: Structured-output

**Prompt:**
```
Build a Todo application.

Return the output in this exact format:
1. Project structure (folder tree)
2. Database schema (SQL)
3. API routes (method, path, description)
4. React components (name, props, description)
5. Implementation code for each file
```

**Output Summary:**
Very organized. Got exactly what I asked for in the right order. Easy to copy and use. Each section was clearly separated.

**Strengths:**
- Predictable format
- Easy to review
- Complete coverage
- No guessing what's included

**Weaknesses:**
- Rigid structure
- Less creative freedom
- Some sections felt forced

---

## Style 5: Few-shot

**Prompt:**
```
Build a Todo application.

Here's an example of what I want for a similar project:

Example - Blog App:
- Frontend: React + TypeScript + Tailwind
- Backend: Express + MongoDB
- Auth: JWT
- Features: CRUD, search, categories

Now build the Todo app following the same pattern.
```

**Output Summary:**
Followed the pattern closely. Got the same tech stack and structure as the example. Consistent and predictable.

**Strengths:**
- Consistent output
- Matches expected pattern
- Easy to compare with reference

**Weaknesses:**
- Limited creativity
- Didn't suggest improvements over the example
- Copied some patterns that weren't ideal

---

## Comparison Table

| Style | Speed | Quality | Best For | My Rating |
|-------|-------|---------|----------|-----------|
| Zero-shot | Fast | Low | Quick ideas | 4/10 |
| Role-based | Medium | High | Production code | 8/10 |
| Chain-of-thought | Slow | High | Complex problems | 8/10 |
| Structured-output | Medium | High | Documentation | 7/10 |
| Few-shot | Medium | Medium | Consistent patterns | 6/10 |

---

## What Actually Worked Best

**Role-based and Chain-of-thought tied for me.**

Role-based gave me the best code quality — it just produced better software. Chain-of-thought was best for understanding the problem — the step-by-step thinking helped me see things I missed.

For day-to-day work, I'm using Role-based for code and Chain-of-thought for architecture decisions.

Zero-shot is only useful when I'm brainstorming and don't care about quality.

Structured-output is great for documentation and reports.

Few-shot is useful when I have a reference project and want consistency.
