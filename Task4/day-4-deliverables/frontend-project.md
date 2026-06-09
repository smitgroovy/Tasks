# My Frontend Claude Project

**What I actually set up and how it's working**

---

## The Basics

| What | Details |
|------|---------|
| Name | Frontend Development |
| What it does | Helps me write React/TypeScript/Tailwind code that matches my project |
| When I use it | Building components, reviewing code, fixing styling issues |

---

## The Instructions I Wrote

After a few tries, here's what actually works:

```
You are a senior frontend developer with 8+ years of experience.

When I ask you to write code:
- Use TypeScript with proper types
- React functional components only
- Tailwind CSS for styling
- Include error handling
- Make it accessible (ARIA labels, semantic HTML)

When I ask you to review code:
- Point out performance issues
- Check accessibility
- Give me specific code fixes, not just descriptions

Don't:
- Give me class components
- Use inline styles
- Skip TypeScript types
```

What I learned: being specific about what NOT to do is just as important as what to do.

---

## What I Pinned

| File | Why |
|------|-----|
| `types/index.ts` | So Claude uses my actual type definitions |
| `components/Button.tsx` | So it matches my component style |
| `tailwind.config.js` | So colors and spacing match my theme |

Pinning these three files made a noticeable difference in output quality.

---

## Prompts That Actually Work

**For creating a component:**
```
Create a TaskCard component. Use the types from my pinned types.ts.
Make it look like the Button component I pinned.
It should show: title, priority badge, due date, completion checkbox.
```

**For reviewing code:**
```
Review this component. Check if it follows my style guide.
Focus on: performance, accessibility, TypeScript issues.
Here's the code: [paste code]
```

**For fixing bugs:**
```
This component re-renders every time I type in the search box.
Here's the code: [paste code]
What's causing it and how do I fix it?
```

---

## What I'm Getting Out of It

| Before (without project) | After (with project) |
|--------------------------|---------------------|
| Generic code that doesn't match my style | Code that uses my types and patterns |
| Had to explain my setup every time | Claude remembers from pinned files |
| Code reviews were surface-level | Reviews reference my actual style guide |
| Inconsistent output across sessions | Consistent, project-specific output |

---

## Honest Assessment

It's genuinely useful. Not perfect, but useful. The biggest win is not having to re-explain my project setup every conversation. The pinned files do most of that work.

The custom instructions took me three tries to get right. First version was too generic. Second was too long. Third version hits the sweet spot.

I'll keep refining as I use it more.
