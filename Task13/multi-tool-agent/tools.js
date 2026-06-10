// Tool Definitions and Implementations
// Day 13 - Multi-Tool Agent (NVIDIA NIM / OpenAI-compatible format)

import * as cheerio from 'cheerio';

// ============================================
// TOOL DEFINITIONS (OpenAI Function Calling Format)
// ============================================

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "calculate",
      description: "Perform mathematical calculations. Supports basic arithmetic (add, subtract, multiply, divide), exponents, square roots, and percentages. Use when the user asks for any math calculation.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Mathematical expression to evaluate (e.g., '2 + 3', '15% of 200', 'sqrt(144)')"
          }
        },
        required: ["expression"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for current information. Use when the user needs facts, news, definitions, or recent information. Do NOT use for math or creative tasks.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query - be specific and concise for best results"
          },
          num_results: {
            type: "integer",
            description: "Number of results to return (1-5). Default is 3.",
            minimum: 1,
            maximum: 5
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_slack_notification",
      description: "Send a notification message to Slack. Use when the user asks to notify a team, send an alert, or says 'tell the team' or 'send to slack'.",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The message to send to Slack"
          },
          channel: {
            type: "string",
            description: "Slack channel name (e.g., 'general', 'alerts', 'engineering')"
          },
          priority: {
            type: "string",
            enum: ["low", "normal", "high", "urgent"],
            description: "Message priority level. Default is normal."
          }
        },
        required: ["message"]
      }
    }
  }
];

// ============================================
// TOOL IMPLEMENTATIONS
// ============================================

/**
 * Calculator Tool
 * Evaluates mathematical expressions safely
 */
export function calculate(expression) {
  console.log(`\n🧮 Calculating: ${expression}`);

  try {
    // Clean and validate expression
    const cleaned = expression
      .replace(/\s+/g, '')
      .replace(/sqrt\(([^)]+)\)/gi, 'Math.sqrt($1)')
      .replace(/pow\(([^,]+),([^)]+)\)/gi, 'Math.pow($1,$2)')
      .replace(/(\d+)%\s*of\s*(\d+)/gi, '($1/100*$2)')
      .replace(/(\d+)%/gi, '($1/100)');

    // Safety check - only allow numbers, operators, and Math functions
    if (!/^[\d\s+\-*/().Math.sqrt,pow%]+$/.test(cleaned)) {
      return {
        success: false,
        error: "Invalid expression. Only numbers and basic operators are allowed."
      };
    }

    // Use Function constructor for safe evaluation
    const result = new Function(`return ${cleaned}`)();

    if (typeof result !== 'number' || isNaN(result)) {
      return {
        success: false,
        error: "Expression did not evaluate to a valid number"
      };
    }

    console.log(`✅ Result: ${result}`);
    return {
      success: true,
      expression: expression,
      result: result,
      formatted: Number.isInteger(result) ? result.toString() : result.toFixed(4)
    };

  } catch (error) {
    return {
      success: false,
      error: `Calculation error: ${error.message}`
    };
  }
}

/**
 * Web Search Tool
 * Searches DuckDuckGo for information
 */
export async function webSearch(query, numResults = 3) {
  console.log(`\n🔍 Searching: "${query}"`);

  try {
    const params = new URLSearchParams({
      q: query,
      kl: 'us-en'
    });

    const response = await fetch(`https://html.duckduckgo.com/html/?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.result').each((index, element) => {
      if (index >= numResults) return false;

      const $el = $(element);
      const title = $el.find('.result__title a').text().trim();
      const url = $el.find('.result__title a').attr('href') || '';
      const snippet = $el.find('.result__snippet').text().trim();

      if (title && snippet) {
        // Clean DuckDuckGo redirect URL
        const cleanUrl = url.match(/uddg=([^&]+)/)
          ? decodeURIComponent(url.match(/uddg=([^&]+)/)[1])
          : url;

        results.push({ title, url: cleanUrl, snippet });
      }
    });

    console.log(`✅ Found ${results.length} results`);
    return {
      success: true,
      query: query,
      results: results,
      formatted: results.map((r, i) =>
        `${i + 1}. ${r.title}\n   ${r.snippet}\n   ${r.url}`
      ).join('\n\n')
    };

  } catch (error) {
    return {
      success: false,
      error: `Search error: ${error.message}`
    };
  }
}

/**
 * Slack Notification Tool
 * Sends messages to Slack via webhook
 */
export async function sendSlackNotification(message, channel = 'general', priority = 'normal') {
  console.log(`\n📢 Sending Slack notification to #${channel}`);

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  // If no webhook configured, simulate the notification
  if (!webhookUrl || webhookUrl.includes('YOUR/WEBHOOK')) {
    console.log('⚠️  Slack webhook not configured - simulating notification');

    const simulated = {
      channel: `#${channel}`,
      message: message,
      priority: priority,
      timestamp: new Date().toISOString(),
      status: 'simulated'
    };

    console.log(`✅ Notification simulated:`, JSON.stringify(simulated, null, 2));

    return {
      success: true,
      simulated: true,
      data: simulated,
      note: "This is a simulated notification. Configure SLACK_WEBHOOK_URL to send real messages."
    };
  }

  // Send real Slack notification
  try {
    const emoji = {
      low: '📝',
      normal: '💬',
      high: '⚠️',
      urgent: '🚨'
    }[priority] || '💬';

    const payload = {
      channel: channel,
      text: `${emoji} ${message}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${emoji} *${priority.toUpperCase()}*\n${message}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Sent by Multi-Tool Agent | ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log(`✅ Notification sent successfully`);
    return {
      success: true,
      channel: `#${channel}`,
      message: message,
      priority: priority
    };

  } catch (error) {
    return {
      success: false,
      error: `Slack error: ${error.message}`
    };
  }
}

/**
 * Execute a tool by name
 */
export async function executeTool(toolName, input) {
  console.log(`\n${'='.repeat(40)}`);
  console.log(`🔧 Tool: ${toolName}`);
  console.log(`📥 Input:`, JSON.stringify(input, null, 2));

  switch (toolName) {
    case 'calculate':
      return calculate(input.expression);

    case 'web_search':
      return await webSearch(input.query, input.num_results);

    case 'send_slack_notification':
      return await sendSlackNotification(
        input.message,
        input.channel,
        input.priority
      );

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
