# Few-Shot Prompting Examples

**Date:** June 9, 2026
**Objective:** Demonstrate Few-Shot Prompting with 5 complete examples.

---

# What is Few-Shot Prompting?

Few-Shot Prompting is a technique where you provide the LLM with a small number of examples (2-5) that demonstrate the desired input-output pattern. The LLM then follows this pattern to generate output for new inputs.

---

# 5 Complete Examples

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

## Example 3: Feature Request to API Design

**Input (Feature Request):**
```
Users want to export their tasks as a PDF report with charts showing completion statistics.
```

**Output (API Design):**
```
Endpoint: POST /api/reports/tasks/export
Auth: JWT required
Request Body:
{
  "dateRange": { "from": "2026-01-01", "to": "2026-06-09" },
  "includeCharts": true,
  "format": "pdf"
}
Response: Binary PDF file
Headers: Content-Type: application/pdf
Error Codes:
- 400: Invalid date range
- 401: Unauthorized
- 404: No tasks found in range
- 500: PDF generation failed
```

---

## Example 4: Code Review Feedback to Fixes

**Input (Code Review Feedback):**
```
The login endpoint has SQL injection vulnerability, no rate limiting, and passwords are stored in plain text.
```

**Output (Fixes):**
```
1. SQL Injection Fix:
   - Replace string concatenation with parameterized queries
   - Use: db.query('SELECT * FROM users WHERE email = ?', [email])

2. Rate Limiting:
   - Add express-rate-limit middleware
   - Limit: 5 requests per 15 minutes per IP
   - Return 429 status with retry-after header

3. Password Security:
   - Hash passwords with bcrypt (salt rounds: 12)
   - Never store plain text passwords
   - Use constant-time comparison for verification

4. Additional Security:
   - Add account lockout after 10 failed attempts
   - Log failed login attempts
   - Return generic error message (don't reveal if email exists)
```

---

## Example 5: Performance Issue to Optimization Plan

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

# Explanation

---

## What is Few-Shot Prompting?

Few-Shot Prompting is an in-context learning technique where you provide 2-5 examples of input-output pairs to demonstrate the desired pattern. The LLM learns from these examples and applies the same pattern to new inputs without requiring fine-tuning.

## Why It Works

1. **Pattern Recognition:** LLMs are excellent at identifying patterns from examples
2. **Context Learning:** Examples provide context that pure instructions cannot
3. **Consistency:** Ensures output follows a specific format and style
4. **Reduced Ambiguity:** Examples eliminate guesswork about expected output
5. **Zero-Training:** No model training required - works with any capable LLM

## When to Use It

| Use Case | Why Few-Shot Helps |
|----------|-------------------|
| Data Transformation | Shows exact format conversion |
| Code Generation | Demonstrates coding style and patterns |
| Content Writing | Establishes tone, format, and structure |
| Classification | Defines categories and boundaries |
| API Design | Shows schema patterns and conventions |
| Documentation | Establishes documentation style |

## Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Too few examples (1) | Insufficient pattern learning | Use 2-5 examples |
| Inconsistent examples | Confuses the LLM | Keep format consistent |
| Examples too similar | Doesn't cover edge cases | Include variety |
| No clear input/output | Pattern unclear | Label input and output |
| Examples too complex | Hard to identify pattern | Start simple, add complexity |
| Mixing styles | Inconsistent output | Use same tone and format |

---

# Summary

Few-Shot Prompting is one of the most powerful techniques for getting consistent, high-quality output from LLMs. By providing clear examples, you teach the model exactly what you want without complex instructions.
