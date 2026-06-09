# Cost Report — Multi-Provider AI CLI

## Model Pricing Overview

| Model | Provider | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) |
|-------|----------|---------------------------|----------------------------|
| Claude 3.5 Haiku | Anthropic | $0.80 | $4.00 |
| GPT-4o-mini | OpenAI | $0.15 | $0.60 |
| Gemini 2.5 Flash | Google | $0.10 | $0.40 |

---

## Benchmark Cost Estimates

Based on the 50-prompt benchmark with average token usage:

| Metric | Claude 3.5 Haiku | GPT-4o-mini | Gemini 2.5 Flash |
|--------|-----------------|-------------|-----------------|
| Avg input tokens/prompt | ~150 | ~150 | ~150 |
| Avg output tokens/prompt | ~300 | ~300 | ~300 |
| Cost per prompt | $0.000210 | $0.000041 | $0.000038 |
| **50 prompts** | **$0.0105** | **$0.0020** | **$0.0019** |
| **500 prompts** | **$0.1050** | **$0.0203** | **$0.0190** |
| **5,000 prompts** | **$1.0500** | **$0.2025** | **$0.1900** |

---

## Detailed Cost Breakdown per Model

### Claude 3.5 Haiku (Anthropic)

| Volume | Input Cost | Output Cost | Total Cost |
|--------|-----------|-------------|------------|
| 50 prompts | $0.0060 | $0.0060 | $0.0105* |
| 500 prompts | $0.0600 | $0.0600 | $0.1050* |
| 5,000 prompts | $0.6000 | $0.6000 | $1.0500* |

*Based on ~150 input and ~300 output tokens per prompt.

### GPT-4o-mini (OpenAI)

| Volume | Input Cost | Output Cost | Total Cost |
|--------|-----------|-------------|------------|
| 50 prompts | $0.0011 | $0.0009 | $0.0020* |
| 500 prompts | $0.0113 | $0.0090 | $0.0203* |
| 5,000 prompts | $0.1125 | $0.0900 | $0.2025* |

### Gemini 2.5 Flash (Google)

| Volume | Input Cost | Output Cost | Total Cost |
|--------|-----------|-------------|------------|
| 50 prompts | $0.0008 | $0.0006 | $0.0019* |
| 500 prompts | $0.0075 | $0.0060 | $0.0190* |
| 5,000 prompts | $0.0750 | $0.0600 | $0.1900* |

---

## Cost Comparison Summary

### Cheapest to Most Expensive (50 prompts)

```
1. Gemini 2.5 Flash     $0.0019  ████████████████████
2. GPT-4o-mini          $0.0020  █████████████████████
3. Claude 3.5 Haiku     $0.0105  ██████████████████████████████████████████████████████████
```

### Cost per 1,000 Prompts

| Rank | Model | Cost | Cost per 1K |
|------|-------|------|-------------|
| 1 | Gemini 2.5 Flash | $0.038 | $0.038 |
| 2 | GPT-4o-mini | $0.041 | $0.041 |
| 3 | Claude 3.5 Haiku | $0.210 | $0.210 |

---

## Production Scaling Estimates

### Scenario 1: Chatbot Application (10K users/day, 5 messages each)

| Model | Daily Cost | Monthly Cost | Annual Cost |
|-------|-----------|-------------|-------------|
| Gemini 2.5 Flash | $1.90 | $57.00 | $693.50 |
| GPT-4o-mini | $2.03 | $60.75 | $739.13 |
| Claude 3.5 Haiku | $10.50 | $315.00 | $3,832.50 |

### Scenario 2: Code Review Tool (1K reviews/day, 10 prompts each)

| Model | Daily Cost | Monthly Cost | Annual Cost |
|-------|-----------|-------------|-------------|
| Gemini 2.5 Flash | $0.38 | $11.40 | $138.70 |
| GPT-4o-mini | $0.41 | $12.15 | $147.83 |
| Claude 3.5 Haiku | $2.10 | $63.00 | $766.50 |

### Scenario 3: Enterprise API (100K requests/day)

| Model | Daily Cost | Monthly Cost | Annual Cost |
|-------|-----------|-------------|-------------|
| Gemini 2.5 Flash | $3.80 | $114.00 | $1,387.00 |
| GPT-4o-mini | $4.05 | $121.50 | $1,478.25 |
| Claude 3.5 Haiku | $21.00 | $630.00 | $7,665.00 |

---

## Conclusions

1. **Gemini 2.5 Flash is the most cost-effective option**, with pricing roughly 5x cheaper than Claude 3.5 Haiku and comparable to GPT-4o-mini.

2. **GPT-4o-mini offers the best value** when considering the balance of cost, quality, and the OpenAI ecosystem's maturity.

3. **Claude 3.5 Haiku is significantly more expensive** but may offer superior quality for certain tasks, justifying the cost in high-value applications.

4. **For production workloads**, the cost difference becomes substantial at scale. A 50K requests/day workload can save $200+/month by choosing Gemini Flash over Claude Haiku.

5. **Free tiers** from all three providers can significantly reduce costs during development and testing. Gemini offers the most generous free tier.

6. **Cost optimization strategies** to implement regardless of provider:
   - Cache frequent responses
   - Compress conversation history
   - Use streaming to reduce timeout costs
   - Batch non-urgent requests
   - Monitor and alert on cost anomalies

---

*Report generated as part of Day 7 internship deliverable.*
*Pricing data based on publicly available rates as of early 2025.*
