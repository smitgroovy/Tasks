# Claude Projects — What I Learned Today

**Date:** June 9, 2026

---

## So What Actually Are Claude Projects?

Honestly, before today I thought Claude was just another chatbot. You type something, it answers, you start over. But Projects change that. It's like giving Claude a permanent desk with all your files on it — it remembers everything across conversations.

I spent the morning setting one up and here's what I found.

---

## How I Set It Up

1. Went to claude.ai, clicked "Projects" on the left sidebar
2. Hit "Create Project" 
3. Named it "Frontend Development"
4. Added custom instructions (this part is important — I'll explain below)
5. Pinned some reference files
6. Started chatting

The whole thing took maybe 10 minutes. But the instructions part took me a while to get right.

---

## Custom Instructions — The Game Changer

This is where you tell Claude how to behave. Not just "you are a developer" but actual rules. Here's what I eventually wrote after a few tries:

```
You are a senior frontend developer.

When writing code:
- Always use TypeScript
- Use functional components with hooks
- Style with Tailwind CSS
- Include proper error handling
- Add accessibility attributes

When reviewing code:
- Check for performance issues
- Look for accessibility problems
- Suggest specific fixes with code examples
```

First version was way too vague. "Write good code" doesn't help. The more specific I got, the better the output.

---

## File Pinning — Why It Matters

This is the part I didn't expect to be so useful. You can pin files to your project — like your type definitions, your style guide, your component templates. Claude reads them every time.

I pinned:
- My `types.ts` file (so Claude uses my actual types)
- A `Button.tsx` component (so it matches my style)
- The project's `tailwind.config.js` (so colors and spacing match)

Before pinning: Claude gave me generic code that didn't match my project.
After pinning: Claude gave me code that actually fit.

Big difference.

---

## What I Tried

### Attempt 1: "Create a TaskCard component"
Without pinned files, Claude gave me a basic card with inline styles. Not terrible, but not what I needed.

### Attempt 2: Same prompt, but with files pinned
Claude used my types, matched my Tailwind classes, and even used the same component structure as my Button. Much better.

### Attempt 3: "Review this code against our style guide"
Claude actually referenced the pinned style guide and pointed out that I wasn't using consistent spacing. That felt like a real code review.

---

## What I'd Tell Other Interns

1. **Don't skip the instructions** — Take 15 minutes to write good ones. It saves hours later.
2. **Pin your types** — If you have TypeScript definitions, pin them. Claude will use them.
3. **Start simple** — Don't try to build everything at once. One project per task.
4. **Iterate on instructions** — My first version was bad. Third version was much better.
5. **It's not perfect** — Claude still makes mistakes. You still need to check the output.

---

## The Reality Check

Claude Projects are cool, but they're not magic. Here's what I actually experienced:

**What worked great:**
- Component generation with my types
- Code reviews against my style guide
- Remembering context across conversations

**What didn't work as well:**
- Sometimes it forgot instructions mid-conversation
- Complex multi-file changes still needed manual work
- Had to re-explain some project context even with pinned files

**Bottom line:** It's a solid tool that saves time, but you still need to think and verify.

---

## Screenshots

*(Adding after I figure out how to take good screenshots)*

---

## Next Steps

- Refine my custom instructions based on more usage
- Create separate projects for backend and code review
- Pin more files as the project grows
