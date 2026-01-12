import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

// ⚡ QUICK TIMEOUT - 10 seconds max
const client = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  timeout: 10000, // 10 second timeout
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://pumpportal.fun',
    'X-Title': 'Token Launcher'
  }
});

export async function validateNarrative(trendSummary: string): Promise<any> {
  console.log('[AI] Validating narrative with OpenRouter...');
  
  // ⚠️ SKIP API if key is missing
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-key') {
    console.log('[AI] No OpenRouter key - returning mock response');
    return {
      confidence: 75,
      verdict: 'hot',
      reasoning: 'API key not configured - defaulting to positive'
    };
  }

  try {
    const prompt = `Analyze if this crypto narrative is currently trending:

${trendSummary}

Respond ONLY in this JSON format (no markdown):
{
  "confidence": 0-100,
  "verdict": "hot" | "neutral" | "dead",
  "reasoning": "brief explanation"
}`;

    console.log('[AI] Sending request to OpenRouter...');
    
    const response = await client.post('/chat/completions', {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('[AI] Got OpenRouter response');
    
    const content = response.data.choices[0].message.content;
    const cleaned = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    console.log('[AI] Narrative validation:', parsed);
    return parsed;

  } catch (error: any) {
    console.error('[AI] OpenRouter API error:', error.message);
    
    // 🔥 FALLBACK - don't block launch
    return {
      confidence: 70,
      verdict: 'neutral',
      reasoning: 'API unavailable - allowing launch with caution'
    };
  }
}

export async function generateNameAndLore(userPrompt: any, trendData: string): Promise<any> {
  console.log('[AI] Generating name and lore...');
  
  // ⚠️ SKIP API if key is missing
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-key') {
    console.log('[AI] No OpenRouter key - returning mock token');
    return {
      name: userPrompt.idea.substring(0, 20) || 'Test Token',
      symbol: (userPrompt.symbolHint || 'TEST').toUpperCase().substring(0, 5),
      lore: `${userPrompt.idea}. ${userPrompt.tone} vibes.`,
      tags: ['meme', 'ai', 'trending']
    };
  }

  try {
    const prompt = `Create a Solana meme token based on:

User Idea: ${userPrompt.idea}
Tone: ${userPrompt.tone}
Symbol Hint: ${userPrompt.symbolHint}
Market Trends: ${trendData}

Generate ORIGINAL token metadata (no existing token names).

Respond ONLY in this JSON format (no markdown):
{
  "name": "max 20 chars",
  "symbol": "3-5 CAPS chars",
  "lore": "max 200 chars, catchy description",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    console.log('[AI] Sending generation request...');
    
    const response = await client.post('/chat/completions', {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 500
    });

    console.log('[AI] Got generation response');
    
    const content = response.data.choices[0].message.content;
    const cleaned = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    console.log('[AI] Generated token:', parsed);
    return parsed;

  } catch (error: any) {
    console.error('[AI] OpenRouter generation error:', error.message);
    
    // 🔥 FALLBACK - create basic token from user input
    return {
      name: userPrompt.idea.substring(0, 20) || 'Meme Token',
      symbol: (userPrompt.symbolHint || 'MEME').toUpperCase().substring(0, 5),
      lore: `${userPrompt.idea}. ${userPrompt.tone} energy. Built different.`,
      tags: ['meme', 'solana', 'pump']
    };
  }
}
