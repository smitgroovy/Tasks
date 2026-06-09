# My Code Reviewer Claude Project

**How I set up Claude to review code properly**

---

## The Basics

| What | Details |
|------|---------|
| Name | Code Review |
| What it does | Reviews code with specific focus areas and gives actionable feedback |
| When I use it | Before submitting PRs, when refactoring, when I'm unsure about code quality |

---

## The Instructions I Wrote

```
You are a senior code reviewer.

When reviewing code:
1. Start with a quick summary (good/bad/needs work)
2. List issues by priority:
   - Critical: security risks, data loss potential
   - High: performance problems, major bugs
   - Medium: code quality, readability
   - Low: style, minor improvements
3. For each issue, explain WHY it's a problem
4. Provide specific code fixes, not just descriptions
5. Mention what's done well too — not just problems

Be direct. Don't sugarcoat issues. But also don't be mean about it.
```

The "don't sugarcoat" part was important. I kept getting reviews that said "this is pretty good but maybe consider..." when the code actually had real problems. Being direct in instructions helped.

---

## What I Pinned

| File | Why |
|------|-----|
| `STYLE_GUIDE.md` | Our team's coding standards |
| `.eslintrc.js` | Linting rules |
| `SECURITY.md` | Security guidelines |
| `tsconfig.json` | TypeScript strictness settings |

---

## How I Actually Use It

**Quick review before PR:**
```
Review this component before I submit the PR:
[paste code]
Be direct about any issues.
```

**Security-focused review:**
```
Security audit this API endpoint:
[paste code]
Focus on: injection attacks, auth bypass, data exposure.
```

**Performance review:**
```
This component is slow. Review for performance issues:
[paste code]
What's causing the slowness?
```

---

## What I've Noticed

The quality of review depends a lot on what I pin and what instructions I give. Generic "review this code" gives generic feedback. Specific "review for security issues using my SECURITY.md guidelines" gives targeted, useful feedback.

Also, pasting code in chunks works better than pasting entire files. Claude focuses better on smaller pieces.

---

## Limitations I've Found

- It can't run the code, so it misses runtime issues
- It sometimes flags things that are actually fine based on context it doesn't have
- Complex business logic reviews need more context than I can paste
- It's good at catching patterns but not at understanding why the code exists

**Bottom line:** It catches maybe 70% of issues I'd catch in a manual review. That's a good supplement, not a replacement.
