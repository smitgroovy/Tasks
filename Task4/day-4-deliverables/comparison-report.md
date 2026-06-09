# ChatGPT vs Claude vs Gemini — My Actual Testing

**Date:** June 9, 2026
**What I did:** Gave the same 5 prompts to all three LLMs and compared what came back

---

## How I Tested

I picked 5 prompts that cover real software engineering tasks. For each prompt, I copy-pasted the exact same text into ChatGPT, Claude, and Gemini. Then I scored each response on a few criteria.

Not scientific. Just practical.

---

## The 5 Prompts I Used

1. Build a responsive dashboard using React and Tailwind CSS
2. Create REST APIs for an ecommerce application
3. Review and improve a React component
4. Write a blog about AI Agents
5. Design a scalable SaaS architecture

---

## Prompt 1: Build a Responsive Dashboard

### What ChatGPT Gave Me
A working component with sidebar, charts, responsive grid. Used Recharts for graphs. Had dark mode toggle.

**What I liked:** It just worked. Copy-paste ready.
**What I didn't:** No TypeScript types. Generic styling.

### What Claude Gave Me
Full TypeScript interfaces. Broke it into smaller components. Added loading states and error boundaries. Included accessibility attributes.

**What I liked:** Production-ready code. Thought about edge cases.
**What I didn't:** Longer than I needed for a quick prototype.

### What Gemini Gave Me
Basic layout with CSS grid. Simple component structure. Minimal styling.

**What I liked:** Easy to understand. Good starting point.
**What I didn't:** Too basic. No types. No error handling.

| | ChatGPT | Claude | Gemini |
|--|---------|--------|--------|
| Response Quality | 8 | 9 | 6 |
| Code Quality | 7 | 9 | 5 |
| Reasoning | 7 | 9 | 6 |
| **Score** | **7.3** | **9.0** | **5.7** |

---

## Prompt 2: Create REST APIs for Ecommerce

### What ChatGPT Gave Me
Express routes with CRUD operations. Basic error handling. No validation library.

**What I liked:** Complete routes I could run immediately.
**What I didn't:** No input validation. No auth. No database schema.

### What Claude Gave Me
Full API design with Zod validation, JWT auth, PostgreSQL schema, error handling middleware, and documentation.

**What I liked:** Security-first. Complete. Production-ready.
**What I didn't:** Very long response. Might be overkill for small projects.

### What Gemini Gave Me
Simple REST endpoints. Minimal error handling. No validation.

**What I liked:** Quick to understand. Simple.
**What I didn't:** No validation. No auth. Basically a skeleton.

| | ChatGPT | Claude | Gemini |
|--|---------|--------|--------|
| Response Quality | 7 | 9 | 5 |
| Code Quality | 6 | 9 | 4 |
| Reasoning | 7 | 9 | 5 |
| **Score** | **6.7** | **9.0** | **4.7** |

---

## Prompt 3: Review a React Component

### What ChatGPT Gave Me
Caught missing keys in lists. Suggested React.memo for performance. Basic prop drilling suggestions.

**What I liked:** Practical suggestions.
**What I didn't:** Missed accessibility issues. No TypeScript feedback.

### What Claude Gave Me
Multi-dimensional review: security, performance, accessibility, TypeScript, maintainability. Prioritized issues with severity levels. Gave code examples for fixes.

**What I liked:** Thorough. Actionable. Prioritized.
**What I didn't:** A lot to read. Might overwhelm for simple components.

### What Gemini Gave Me
Basic suggestions about naming conventions and simple refactoring.

**What I liked:** Easy to understand.
**What I didn't:** Missed real issues. Too surface-level.

| | ChatGPT | Claude | Gemini |
|--|---------|--------|--------|
| Response Quality | 7 | 9 | 5 |
| Code Quality | 7 | 9 | 5 |
| Reasoning | 7 | 9 | 5 |
| **Score** | **7.0** | **9.0** | **5.0** |

---

## Prompt 4: Write a Blog About AI Agents

### What ChatGPT Gave Me
Well-structured post. Clear sections. Good flow. Balanced technical and non-technical.

**What I liked:** Readable. Good structure.
**What I didn't:** Generic. Nothing I hadn't read before.

### What Claude Gave Me
Thoughtful, deeper analysis. Unique perspectives. Practical applications. Forward-looking.

**What I liked:** Original thinking. Not just regurgitating existing content.
**What I didn't:** Longer than needed. A bit heavy.

### What Gemini Gave Me
Basic coverage. Clear but not engaging. Standard content.

**What I liked:** Simple. Good for beginners.
**What I didn't:** Forgettable. No depth.

| | ChatGPT | Claude | Gemini |
|--|---------|--------|--------|
| Response Quality | 8 | 9 | 6 |
| Reasoning | 7 | 9 | 6 |
| Creativity | 7 | 9 | 5 |
| **Score** | **7.3** | **9.0** | **5.7** |

---

## Prompt 5: Design a Scalable SaaS Architecture

### What ChatGPT Gave Me
Standard SaaS architecture: database, API, frontend. Basic scaling notes.

**What I liked:** Complete overview. Good reference.
**What I didn't:** Generic. No cost analysis. Limited scalability depth.

### What Claude Gave Me
Microservices breakdown, scaling strategies, cost analysis, monitoring setup, disaster recovery. Production-focused.

**What I liked:** Deep thinking. Cost-aware. Real-world applicable.
**What I didn't:** Over-engineered for small projects.

### What Gemini Gave Me
Basic architecture diagram. Standard components.

**What I liked:** Simple. Understandable.
**What I didn't:** Too shallow. No scaling strategies. No cost considerations.

| | ChatGPT | Claude | Gemini |
|--|---------|--------|--------|
| Response Quality | 7 | 10 | 5 |
| Reasoning | 7 | 10 | 5 |
| Creativity | 6 | 9 | 5 |
| **Score** | **6.7** | **9.7** | **5.0** |

---

## Final Scores

| Prompt | ChatGPT | Claude | Gemini |
|--------|---------|--------|--------|
| Dashboard | 7.3 | 9.0 | 5.7 |
| REST APIs | 6.7 | 9.0 | 4.7 |
| Code Review | 7.0 | 9.0 | 5.0 |
| AI Blog | 7.3 | 9.0 | 5.7 |
| SaaS Architecture | 6.7 | 9.7 | 5.0 |
| **Average** | **7.0** | **9.1** | **5.2** |

---

## What I Actually Learned

**Claude is the clear winner for code.** It produces production-ready output with proper types, error handling, and security considerations. It's not even close.

**ChatGPT is good for quick stuff.** When I need a fast prototype or a simple answer, ChatGPT is faster and good enough. It's the "I need this in 2 minutes" tool.

**Gemini is the weakest for engineering.** It's fine for learning or simple questions, but I wouldn't use it for real code. It's more like a search engine that writes code.

**My workflow now:**
- Claude for anything that needs to be good
- ChatGPT for quick iterations and simple questions
- Gemini for exploring new concepts

---

## Honest Caveats

- I tested one time per prompt, not averaged over multiple runs
- I'm an intern, not a senior engineer — my scoring is based on what I know
- Different prompts might give different results
- All three are getting better quickly — this might be outdated in a month
