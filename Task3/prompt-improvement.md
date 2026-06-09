# Prompt Improvement Guide

**Date:** June 9, 2026
**Objective:** Learn 5 anti-patterns of bad prompts and how to fix them.

---

# Task 1: Learn 5 Anti-Patterns of Bad Prompts

---

## Anti-Pattern 1: Vague Prompt

**Bad:**

```
Build a website.
```

**Improved:**

```
Build a responsive MERN-based task management application.

Requirements:
- JWT authentication
- CRUD operations
- Responsive UI
- Dark mode
- Production-ready architecture

Return:
- Architecture
- Folder structure
- Source code
- Setup instructions
```

---

## Anti-Pattern 2: Missing Context

**Bad:**

```
Fix this code.
```

**Improved:**

```
You are a senior Node.js engineer.

Context:
Production API serving 5000+ users.

Problem:
Response time increased from 200ms to 2s.

Tasks:
1. Find root cause
2. Explain issue
3. Suggest fixes
4. Provide optimized code
```

---

## Anti-Pattern 3: Multiple Requests At Once

**Bad:**

```
Build frontend backend database deployment and testing.
```

**Improved:**

```
Phase 1: Design architecture.
Phase 2: Implement backend.
Phase 3: Implement frontend.
Phase 4: Testing.
Phase 5: Deployment.

Wait for approval before next phase.
```

---

## Anti-Pattern 4: Missing Output Format

**Bad:**

```
Explain JWT.
```

**Improved:**

```
Explain JWT.

Format:
1. Definition
2. Why use it
3. Real-world example
4. Common mistakes
5. Interview questions
```

---

## Anti-Pattern 5: Blind Code Generation

**Bad:**

```
Generate complete code.
```

**Improved:**

```
Before generating code:
- Identify assumptions
- Security risks
- Performance concerns
- Edge cases

Then generate production-ready code.
```

---

# Exercise 1: 10 Bad Prompts Rewritten

---

## Example 1: MERN

**Bad Prompt:**
Build a MERN app.

**Improved Prompt:**
Build a MERN stack task management application with React frontend, Express backend, MongoDB database, and TypeScript. Include user authentication with JWT, CRUD operations for tasks, and a responsive dashboard. Return architecture diagram, folder structure, and setup instructions.

---

## Example 2: PostgreSQL

**Bad Prompt:**
Create a database.

**Improved Prompt:**
Design a PostgreSQL schema for an e-commerce platform. Include tables for users, products, orders, order items, and categories. Add proper foreign keys, indexes for frequently queried columns, and constraints. Return the complete SQL migration file with comments.

---

## Example 3: Authentication

**Bad Prompt:**
Add login.

**Improved Prompt:**
Implement JWT-based authentication in a Node.js Express API. Include registration, login, logout, password reset, and refresh token rotation. Use bcrypt for password hashing and add rate limiting. Return the complete auth module with middleware and routes.

---

## Example 4: Deployment

**Bad Prompt:**
Deploy my app.

**Improved Prompt:**
Deploy a React + Node.js application to Vercel (frontend) and Railway (backend). Include environment variable configuration, CI/CD pipeline with GitHub Actions, and monitoring setup. Provide step-by-step deployment guide with troubleshooting tips.

---

## Example 5: AI Applications

**Bad Prompt:**
Build an AI chatbot.

**Improved Prompt:**
Build a customer support chatbot using OpenAI API and LangChain. Include conversation memory, document retrieval (RAG), intent classification, and fallback to human agent. Return the complete Python code with FastAPI backend and React frontend integration.

---

## Example 6: APIs

**Bad Prompt:**
Make an API.

**Improved Prompt:**
Design and implement a RESTful API for a blog platform using Node.js, Express, and TypeScript. Include endpoints for posts, comments, categories, and users. Add input validation with Zod, error handling middleware, and Swagger documentation. Return OpenAPI spec and complete route files.

---

## Example 7: React

**Bad Prompt:**
Create a React component.

**Improved Prompt:**
Create a reusable React TypeScript component for a pricing card. Include props for plan name, price, features list, CTA button, and highlighted state. Use Tailwind CSS for styling, add hover effects, and ensure WCAG accessibility. Return the component file with Storybook stories.

---

## Example 8: Node.js

**Bad Prompt:**
Write a Node.js script.

**Improved Prompt:**
Write a Node.js script that reads a CSV file, validates each row against a schema, transforms the data, and inserts it into a PostgreSQL database. Include error handling, logging with Winston, and progress tracking. Return the complete script with package.json dependencies.

---

## Example 9: Testing

**Bad Prompt:**
Write tests.

**Improved Prompt:**
Write Jest unit tests for a user registration service in Node.js. Cover happy path, validation errors, duplicate email handling, and password hashing. Include test fixtures, mock database calls, and achieve 90%+ code coverage. Return the complete test file with setup and teardown.

---

## Example 10: System Design

**Bad Prompt:**
Design a system.

**Improved Prompt:**
Design a real-time notification system for 10 million users. Include architecture for WebSocket connections, message queuing with Redis, delivery tracking, and retry logic. Consider scalability, fault tolerance, and cost. Return architecture diagram, component breakdown, and API contracts.

---

# Summary

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Vague Prompt | No clarity on what to build | Specify tech stack, features, and output |
| Missing Context | No background information | Add role, context, and problem details |
| Multiple Requests | Too many things at once | Break into phases, process sequentially |
| Missing Output Format | Unclear expected format | Define structure and sections |
| Blind Code Generation | No analysis before coding | Add analysis step before implementation |
