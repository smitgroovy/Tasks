# My First 4 Days at Groovy Web

**What I did, what I learned, and what surprised me**

---

## The Short Version

I started an AI-First Engineering internship at Groovy Web. In four days, I went from knowing nothing about AI-assisted development to setting up Claude Projects, comparing LLMs, and building a prompt library. It's been intense but genuinely interesting.

---

## Day 1: Just Getting Set Up

Monday was mostly onboarding stuff. Set up my dev environment — VS Code, Node.js, MongoDB, the usual. Got access to the company repos and internal tools.

Honestly, the hardest part was just remembering all the new passwords and URLs.

What I didn't expect: how much of the onboarding process itself used AI tools. The documentation was well-organized, and there were AI-assisted search tools for finding answers quickly. That was my first hint that this internship would be different.

**What I learned:** A good setup saves you days of headaches later. Take the time to get it right.

---

## Day 2: Playing with AI Tools

Tuesday was about exploring what AI tools are available and how to use them. I'd used ChatGPT before for quick questions, but I'd never thought about it as a serious development tool.

The team showed me how they use Claude, ChatGPT, and Gemini for different tasks. I was surprised by how different they are. Same prompt, totally different output quality.

I spent the afternoon writing prompts and seeing what came back. Some were great. Some were terrible. I started noticing patterns — the prompts that worked well had specific structure and context.

**What I learned:** Not all LLMs are equal. Claude is noticeably better for code. ChatGPT is faster for simple stuff. Gemini is more for learning.

---

## Day 3: Prompt Engineering Deep Dive

Wednesday was the day that actually changed how I work. I learned about prompt engineering — not just "write better prompts" but actual techniques.

The 5 anti-patterns were eye-opening:
- **Vague prompts** — "Build a website" gives you garbage
- **Missing context** — The LLM doesn't know your project
- **Too many requests** — Confuses the model
- **No output format** — You get random structure
- **Blind code generation** — No analysis before coding

I also learned few-shot prompting — giving the LLM 2-5 examples of what you want. It's like showing someone examples instead of just describing what to do. Way more effective.

I built a prompt library with 10 templates. Now when I need to generate code or review something, I have a starting point instead of writing from scratch.

**What I learned:** The quality of your output depends almost entirely on the quality of your prompt. It's a skill worth developing.

---

## Day 4: Claude Projects and Comparisons

Thursday was about putting it all together. I created three Claude Projects:

1. **Frontend Development** — React, TypeScript, Tailwind
2. **Backend Development** — Node.js, Express, PostgreSQL  
3. **Code Review** — Security, performance, maintainability

The key insight: Claude Projects let you pin files and set custom instructions. So instead of explaining your project every time, Claude already knows your types, your style guide, your patterns.

I also ran a proper comparison between ChatGPT, Claude, and Gemini. Gave each the same 5 prompts and scored them. Results weren't surprising once I saw them:
- Claude: 9.1/10 average
- ChatGPT: 7.0/10 average
- Gemini: 5.2/10 average

Claude is genuinely better for production code. It's not even close.

**What I learned:** Setting up a good Claude Project takes 15 minutes but saves hours of repetitive context-setting.

---

## What Surprised Me

1. **How much prompt quality matters.** A well-structured prompt gives you 10x better output than a vague one. I didn't expect the difference to be that dramatic.

2. **How different the LLMs are.** Same prompt, three very different results. Choosing the right tool actually matters.

3. **How useful file pinning is.** Pinning my types.ts to Claude meant it used my actual types in generated code. That's a big deal.

4. **How fast the learning curve is.** Day 1 I knew nothing about AI-first development. Day 4 I was creating specialized AI workspaces and comparing LLMs. The concepts aren't that hard once you dive in.

5. **How much I still don't know.** There's a whole world of AI agents, RAG, fine-tuning, and more. This is just the beginning.

---

## Challenges I Faced

- **Information overload.** So much new information in four days. Taking notes and writing things down helped me process it.

- **Getting instructions right.** My first Claude Project instructions were terrible. Took three tries to get them useful.

- **Knowing what to trust.** AI gives confident answers, but they're not always right. I had to learn to verify everything.

- **Balancing speed and quality.** Wanted to do everything perfectly, but also needed to get things done. "Good enough first, perfect later" was my approach.

---

## What I Want to Learn Next

- How to build AI agents that can actually do things, not just answer questions
- How to integrate AI tools into CI/CD pipelines
- How to evaluate AI output more systematically
- Advanced prompt techniques for complex tasks

---

## What I'd Tell Other Interns

1. **Start with the basics.** Don't try to learn everything at once. Master one tool before moving to the next.

2. **Write things down.** Your future self will thank you. I created docs for everything and it's already saved me time.

3. **Experiment freely.** Try different prompts, different tools, different approaches. That's how you learn what works.

4. **Verify everything.** AI is a tool, not an authority. Always check the output.

5. **Ask questions.** The team has been super helpful. Don't struggle alone.

---

## Gratitude

Thanks to the Groovy Web team for the structured onboarding and patient answers to my many questions. This internship has been exactly what I hoped for — a chance to learn AI-first development in a real work environment.

---

*This post was written as part of my Day 4 deliverables at Groovy Web.*
