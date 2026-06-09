# Prompt Library

**Author:** Smit Patel
**Date:** June 9, 2026
**Purpose:** 10 reusable prompt templates for common development tasks.

---

## Template 1: Feature Builder

```
You are a senior software architect.

Build:
[FEATURE]

Requirements:
[REQUIREMENTS]

Return:
- Architecture
- Folder Structure
- Implementation Plan
- Source Code
```

**Example Usage:**
```
Build a real-time chat feature for a social media app.

Requirements:
- WebSocket connections
- Message history
- Read receipts
- Online status
- Group chats (max 50 members)

Return:
- Architecture
- Folder Structure
- Implementation Plan
- Source Code
```

---

## Template 2: Bug Fixer

```
You are a senior debugging engineer.

Analyze:
[ERROR]

Code:
[CODE]

Return:
- Root Cause
- Explanation
- Fix
- Improved Code
```

**Example Usage:**
```
Analyze: "Maximum call stack size exceeded" error in recursive function.

Code:
function flattenArray(arr) {
  let result = [];
  arr.forEach(item => {
    if (Array.isArray(item)) {
      result = result.concat(flattenArray(item));
    } else {
      result.push(item);
    }
  });
  return result;
}

Return:
- Root Cause
- Explanation
- Fix
- Improved Code
```

---

## Template 3: Code Reviewer

```
Review the following code.

Focus on:
- Security
- Performance
- Maintainability
- Scalability

Return actionable suggestions.
```

**Example Usage:**
```
Review the following code.

Focus on:
- Security
- Performance
- Maintainability
- Scalability

Code:
app.post('/login', (req, res) => {
  const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
  db.query(query, (err, result) => {
    if (result.length > 0) {
      if (req.body.password == result[0].password) {
        res.json({ success: true });
      }
    }
    res.json({ success: false });
  });
});

Return actionable suggestions.
```

---

## Template 4: API Designer

```
Design REST APIs.

Project:
[PROJECT]

Return:
- Endpoints
- Request Schema
- Response Schema
- Error Handling
```

**Example Usage:**
```
Design REST APIs.

Project: Inventory Management System

Return:
- Endpoints
- Request Schema
- Response Schema
- Error Handling
```

---

## Template 5: Database Architect

```
Design PostgreSQL schema.

Requirements:
[REQUIREMENTS]

Return:
- Tables
- Relations
- Indexes
- Constraints
```

**Example Usage:**
```
Design PostgreSQL schema.

Requirements:
- Multi-tenant SaaS application
- Users belong to organizations
- Roles and permissions (RBAC)
- Audit logging for all changes
- Soft deletes for data recovery

Return:
- Tables
- Relations
- Indexes
- Constraints
```

---

## Template 6: UI/UX Generator

```
Act as a senior product designer.

Design UI for:
[PRODUCT]

Requirements:
[REQUIREMENTS]

Return:
- Layout
- Components
- UX Decisions
```

**Example Usage:**
```
Act as a senior product designer.

Design UI for: Fitness tracking mobile app

Requirements:
- Daily workout logging
- Progress charts
- Goal setting
- Social features (challenges)
- Dark/light mode

Return:
- Layout
- Components
- UX Decisions
```

---

## Template 7: PRD Generator

```
Generate a complete Product Requirement Document.

Product:
[PRODUCT]

Include:
- Overview
- User Stories
- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
```

**Example Usage:**
```
Generate a complete Product Requirement Document.

Product: Online Learning Platform (LMS)

Include:
- Overview
- User Stories
- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
```

---

## Template 8: Deployment Expert

```
Explain deployment.

Stack:
[STACK]

Platform:
[PLATFORM]

Include:
- Environment Variables
- CI/CD
- Monitoring
- Troubleshooting
```

**Example Usage:**
```
Explain deployment.

Stack: Next.js frontend + Node.js API + PostgreSQL
Platform: AWS (ECS + RDS + CloudFront)

Include:
- Environment Variables
- CI/CD
- Monitoring
- Troubleshooting
```

---

## Template 9: Interview Preparation

```
Act as a senior interviewer.

Topic:
[TOPIC]

Generate:
- Questions
- Answers
- Follow-Up Questions
```

**Example Usage:**
```
Act as a senior interviewer.

Topic: System Design - URL Shortener

Generate:
- Questions
- Answers
- Follow-Up Questions
```

---

## Template 10: AI Agent Builder

```
Design an AI Agent.

Goal:
[GOAL]

Available Tools:
[TOOLS]

Return:
- Architecture
- Workflow
- Prompts
- Code Structure
```

**Example Usage:**
```
Design an AI Agent.

Goal: Automate customer support ticket classification and routing

Available Tools:
- OpenAI API
- Slack API
- Jira API
- Email API

Return:
- Architecture
- Workflow
- Prompts
- Code Structure
```

---

# Usage Tips

1. Replace all [BRACKETED] sections with your specific requirements
2. Add context about your tech stack and constraints
3. Specify output format if the default is not suitable
4. Use follow-up prompts to refine the output
5. Combine templates for complex projects (e.g., Feature Builder + API Designer)
