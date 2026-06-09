# Prompt Style Comparison

**Date:** June 9, 2026
**Task:** Build a Todo Application using 5 different prompt styles.

---

# Style 1: Basic Prompt

**Prompt:**
```
Build a Todo app.
```

**Generated Output Summary:**
A minimal todo application with a single HTML file containing basic add/delete functionality. No framework, no database, no authentication. Simple inline JavaScript with hardcoded UI.

**Strengths:**
- Quick to generate
- Easy to understand for beginners

**Weaknesses:**
- No tech stack specified
- No features beyond basic CRUD
- Not production-ready
- No documentation or setup instructions

---

# Style 2: Detailed Prompt

**Prompt:**
```
Build a Todo application using React, Node.js, and MongoDB.

Features:
- User authentication (JWT)
- Create, read, update, delete tasks
- Mark tasks as complete
- Filter by status (all, active, completed)
- Responsive design with Tailwind CSS
- Dark mode toggle

Requirements:
- TypeScript for type safety
- RESTful API design
- Error handling middleware
- Input validation with Zod
- Unit tests with Jest

Return:
- Architecture diagram
- Folder structure
- Complete source code
- Setup instructions
```

**Generated Output Summary:**
A full-stack MERN application with authentication, CRUD operations, filtering, and responsive UI. Includes backend API with Express, MongoDB models, React frontend with components, and test files.

**Strengths:**
- Clear tech stack and features
- Specific requirements and constraints
- Comprehensive output expectations
- Production-ready structure

**Weaknesses:**
- May generate a lot of code at once
- Could miss edge cases without explicit mention
- No phased approach for complex features

---

# Style 3: Role-Based Prompt

**Prompt:**
```
You are a senior full-stack engineer with 10 years of experience building production applications.

Task: Build a Todo application that can handle 10,000+ concurrent users.

Context:
- Startup MVP needing to launch in 2 weeks
- Small team (2 developers)
- Budget for cloud hosting (AWS)

Your approach should:
- Prioritize speed to market
- Use battle-tested technologies
- Include monitoring and error tracking
- Be easily maintainable

Generate the complete application with:
- Architecture decisions with justification
- Tech stack recommendations
- Implementation roadmap
- Complete source code
```

**Generated Output Summary:**
A production-focused todo app with architectural justification, technology trade-off analysis, and a phased implementation plan. Includes error tracking (Sentry), monitoring setup, and deployment strategy.

**Strengths:**
- Expert-level decisions and reasoning
- Context-aware recommendations
- Includes trade-off analysis
- Business-aware (budget, timeline)

**Weaknesses:**
- May over-engineer for simple use cases
- Longer response time
- Requires clear context to work well

---

# Style 4: Step-by-Step Prompt

**Prompt:**
```
Build a Todo application step by step.

Phase 1: Database Schema
- Design MongoDB collections for users and tasks
- Include indexes and validation rules

Phase 2: Backend API
- Set up Express with TypeScript
- Create auth routes (register, login, refresh)
- Create task routes (CRUD + filter)
- Add middleware (auth, validation, error handling)

Phase 3: Frontend
- Set up React with Vite and TypeScript
- Create auth pages (login, register)
- Create dashboard with task list
- Add task form and filters
- Implement dark mode

Phase 4: Testing
- Write unit tests for backend services
- Write component tests for React

Phase 5: Deployment
- Configure Docker containers
- Set up CI/CD pipeline

Complete each phase before moving to the next.
```

**Generated Output Summary:**
A modular application built in clear phases. Each phase produces self-contained, testable code. Database schema first, then API, then frontend, then tests, then deployment config.

**Strengths:**
- Clear progression and dependencies
- Easy to review and approve each phase
- Reduces errors by building incrementally
- Good for team collaboration

**Weaknesses:**
- Requires multiple interactions
- May feel slow for simple projects
- Needs careful phase planning

---

# Style 5: Product Requirement Prompt

**Prompt:**
```
Generate a Product Requirement Document (PRD) for a Todo application, then implement it.

Product: TaskFlow - Personal Task Manager

Target Users:
- Individual professionals managing daily tasks
- Students tracking assignments
- Freelancers organizing projects

Core Features:
1. Task Management (CRUD, priorities, due dates)
2. User Accounts (registration, login, profiles)
3. Categories and Tags
4. Search and Filter
5. Dashboard with statistics

Non-Functional Requirements:
- Response time < 200ms
- 99.9% uptime
- Mobile-responsive
- WCAG 2.1 AA accessible

Success Metrics:
- 1000 users in first month
- 80% daily active rate
- 4.5+ app store rating

First generate the PRD, then implement the application based on it.
```

**Generated Output Summary:**
A complete PRD document followed by a full implementation. Includes user personas, user stories, acceptance criteria, and technical specifications. The implementation directly maps to PRD requirements.

**Strengths:**
- Business-first approach
- Clear success criteria
- User-centric design
- Traceable requirements to code

**Weaknesses:**
- Most time-consuming approach
- May generate excessive documentation
- Requires product thinking before coding

---

# Comparison Table

| Style | Speed | Quality | Best For | Output Size |
|-------|-------|---------|----------|-------------|
| Basic | Fast | Low | Quick prototypes | Small |
| Detailed | Medium | High | Standard projects | Large |
| Role-Based | Medium | Very High | Production apps | Large |
| Step-by-Step | Slow | High | Complex projects | Medium per phase |
| Product Requirement | Very Slow | Very High | Product launches | Very Large |

---

# Which Style Produces Best Results for Software Engineering?

**Answer: Detailed Prompt and Role-Based Prompt combined.**

**Reasoning:**

1. **Detailed Prompt** provides clear specifications - tech stack, features, constraints, and expected output. This eliminates ambiguity and produces focused, relevant code.

2. **Role-Based Prompt** adds expert judgment - the LLM acts as an experienced engineer who makes architectural decisions, considers trade-offs, and thinks about maintainability.

3. **Best Practice:** Start with a Product Requirement approach to define what to build, then use Detailed + Role-Based prompts for implementation.

For software engineering specifically, the **Detailed Prompt** is most practical because:
- It produces code that matches requirements
- It includes all necessary context
- It specifies output format
- It balances speed and quality

The **Role-Based Prompt** is best for complex decisions where you need expert reasoning, trade-off analysis, and architectural guidance.
