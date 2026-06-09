# Few-Shot Prompting Examples

**Date:** June 9, 2026
**What I did:** Created 3 examples showing how few-shot prompting works

---

## What Is Few-Shot Prompting?

You give the LLM a few examples of input → output, and it learns the pattern. Instead of explaining what you want, you show it. Then it follows the same pattern for new inputs.

---

## Example 1: User Story to Development Tasks

**Input (User Story):**
```
As a user, I want to reset my password so that I can regain access to my account if I forget it.
```

**Output (Development Tasks):**
```
- Create password reset request endpoint (POST /api/auth/forgot-password)
- Generate secure reset token with expiry (1 hour)
- Send reset email with token link
- Create password reset form page
- Create password reset endpoint (POST /api/auth/reset-password)
- Validate token and new password
- Update password in database
- Invalidate used tokens
- Add rate limiting (3 requests per hour)
- Add success/error UI feedback
```

---

## Example 2: Bug Report to Debugging Steps

**Input (Bug Report):**
```
Users report that the checkout page shows a blank screen on mobile devices. Desktop works fine. Error in console: "Cannot read property 'map' of undefined".
```

**Output (Debugging Steps):**
```
1. Check the checkout component for array mapping without null check
2. Verify API response structure matches expected format
3. Test with mobile viewport in Chrome DevTools
4. Add conditional rendering: data?.map() or data && data.map()
5. Check if mobile-specific API endpoint returns different structure
6. Add loading state while data is being fetched
7. Add error boundary for graceful error handling
8. Test on actual mobile devices (iOS Safari, Android Chrome)
```

---

## Example 3: Performance Issue to Optimization Plan

**Input (Performance Issue):**
```
Dashboard takes 8 seconds to load. Initial investigation shows 47 API calls on page load and unoptimized database queries.
```

**Output (Optimization Plan):**
```
Phase 1: Reduce API Calls (Target: < 5 calls)
- Combine 47 calls into 3 aggregated endpoints
- Implement GraphQL or compound REST endpoints
- Add client-side caching with React Query

Phase 2: Database Optimization
- Add indexes on frequently queried columns
- Implement query result caching with Redis
- Use pagination for large datasets

Phase 3: Frontend Optimization
- Implement lazy loading for dashboard widgets
- Add skeleton loading states
- Optimize bundle size with code splitting

Phase 4: Infrastructure
- Enable CDN for static assets
- Implement response compression (gzip)
- Add Redis caching layer

Expected Result: 8s -> < 2s load time
```

---

## Why This Works

The LLM sees the pattern:
- Input is a problem description
- Output is a structured, actionable list
- Each item is specific and implementable

After 3 examples, it "gets it" and produces similar output for new inputs.

## When I Use This

- Converting requirements to tasks
- Turning bug reports into debugging steps
- Transforming vague ideas into structured plans

## Common Mistake I Made

First time I tried few-shot, my examples were too different from each other. The LLM couldn't figure out the pattern. Keeping examples consistent in format and style is key.
