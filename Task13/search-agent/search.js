// DuckDuckGo Web Search Tool
// Uses DuckDuckGo HTML search (no API key required)

import * as cheerio from 'cheerio';

const SEARCH_URL = 'https://html.duckduckgo.com/html/';

/**
 * Search DuckDuckGo for a query
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - Array of search results
 */
export async function searchWeb(query, maxResults = 5) {
  console.log(`\n🔍 Searching DuckDuckGo for: "${query}"`);

  try {
    const params = new URLSearchParams({
      q: query,
      kl: 'us-en'  // Region: US English
    });

    const response = await fetch(`${SEARCH_URL}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    // Parse DuckDuckGo HTML results
    $('.result').each((index, element) => {
      if (index >= maxResults) return false;

      const $element = $(element);
      const title = $element.find('.result__title a').text().trim();
      const url = $element.find('.result__title a').attr('href') || '';
      const snippet = $element.find('.result__snippet').text().trim();

      if (title && snippet) {
        results.push({
          title,
          url: cleanUrl(url),
          snippet
        });
      }
    });

    console.log(`✅ Found ${results.length} results`);
    return results;

  } catch (error) {
    console.error('❌ Search error:', error.message);
    return [{
      title: 'Search Error',
      url: '',
      snippet: `Failed to search: ${error.message}`
    }];
  }
}

/**
 * Clean DuckDuckGo redirect URLs
 */
function cleanUrl(url) {
  // DuckDuckGo wraps URLs in redirects
  const match = url.match(/uddg=([^&]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return url;
}

/**
 * Format search results for display
 */
export function formatResults(results) {
  if (!results || results.length === 0) {
    return 'No results found.';
  }

  return results.map((r, i) => {
    return `${i + 1}. **${r.title}**
   ${r.snippet}
   🔗 ${r.url}`;
  }).join('\n\n');
}

/**
 * Format search results as context for LLM
 */
export function formatForLLM(results) {
  if (!results || results.length === 0) {
    return 'No search results found.';
  }

  return results.map((r, i) => {
    return `[Result ${i + 1}]
Title: ${r.title}
URL: ${r.url}
Snippet: ${r.snippet}`;
  }).join('\n\n');
}
