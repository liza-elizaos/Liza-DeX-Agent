/**
 * Model Configuration for LIZA AI Agent
 * 
 * Supports multiple LLM providers with cost-optimized options
 * Configure which model to use via environment variables
 */

export type ModelProvider = 'openrouter' | 'anthropic' | 'openai' | 'google' | 'ollama';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  costPer1kTokens: number; // in USD
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'low';
  description: string;
}

/**
 * Available models ordered by cost (cheapest first)
 */
export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  // Ultra-lightweight - Best for high-volume deployments
  'gpt-4-mini': {
    provider: 'openrouter',
    model: 'openai/gpt-4-mini',
    costPer1kTokens: 0.00015, // ~$0.15 per 1M tokens
    speed: 'fast',
    quality: 'medium',
    description: 'GPT-4 Mini - Fast, cheap, good quality',
  },
  'claude-haiku': {
    provider: 'openrouter',
    model: 'anthropic/claude-3.5-haiku',
    costPer1kTokens: 0.00008, // ~$0.08 per 1M tokens
    speed: 'fast',
    quality: 'medium',
    description: 'Claude 3.5 Haiku - Ultra-fast, cheapest',
  },

  // Balanced - Good for most use cases
  'gpt-4-turbo': {
    provider: 'openrouter',
    model: 'openai/gpt-4-turbo',
    costPer1kTokens: 0.01, // ~$10 per 1M tokens
    speed: 'medium',
    quality: 'high',
    description: 'GPT-4 Turbo - Balanced quality and speed',
  },
  'claude-opus': {
    provider: 'openrouter',
    model: 'anthropic/claude-3-opus',
    costPer1kTokens: 0.015, // ~$15 per 1M tokens
    speed: 'medium',
    quality: 'high',
    description: 'Claude 3 Opus - Best quality',
  },

  // Cloud-hosted alternatives
  'palm-2': {
    provider: 'google',
    model: 'models/text-bison-001',
    costPer1kTokens: 0.0005, // ~$0.50 per 1M tokens
    speed: 'fast',
    quality: 'medium',
    description: 'Google PaLM 2 - Good alternative',
  },

  // Local option
  'ollama-local': {
    provider: 'ollama',
    model: 'llama2',
    costPer1kTokens: 0, // Free when self-hosted
    speed: 'slow',
    quality: 'medium',
    description: 'Ollama Local - Free, requires self-hosting',
  },
};

/**
 * Get recommended model based on deployment scenario
 */
export function getRecommendedModel(scenario: 'production' | 'staging' | 'development' | 'testing'): string {
  const recommendations: Record<string, string> = {
    production: 'claude-haiku', // Cheapest + reliable
    staging: 'gpt-4-mini', // Good balance
    development: 'gpt-4-mini', // Fast iteration
    testing: 'claude-haiku', // Minimize costs
  };

  return recommendations[scenario] || 'gpt-4-mini';
}

/**
 * Get model configuration
 */
export function getModelConfig(modelName?: string): ModelConfig {
  const selected = modelName || process.env.OPENROUTER_MODEL || process.env.LLM_MODEL || 'gpt-4-mini';
  
  // Try to find by key
  if (AVAILABLE_MODELS[selected]) {
    return AVAILABLE_MODELS[selected];
  }

  // Try to find by model string
  for (const [, config] of Object.entries(AVAILABLE_MODELS)) {
    if (config.model === selected) {
      return config;
    }
  }

  // Default fallback
  console.warn(`Model "${selected}" not found, using gpt-4-mini`);
  return AVAILABLE_MODELS['gpt-4-mini'];
}

/**
 * Calculate estimated cost
 */
export function estimateCost(modelName: string, inputTokens: number, outputTokens: number): number {
  const config = getModelConfig(modelName);
  const totalTokens = inputTokens + outputTokens;
  return (totalTokens / 1000) * config.costPer1kTokens;
}

/**
 * Format model list for display
 */
export function formatModelsList(): string {
  let output = '📊 Available Models:\n\n';

  const sorted = Object.entries(AVAILABLE_MODELS).sort((a, b) => a[1].costPer1kTokens - b[1].costPer1kTokens);

  for (const [key, config] of sorted) {
    const costPer1M = (config.costPer1kTokens * 1000).toFixed(2);
    output += `• ${key}\n`;
    output += `  Provider: ${config.provider}\n`;
    output += `  Model: ${config.model}\n`;
    output += `  Cost: $${costPer1M} per 1M tokens\n`;
    output += `  Speed: ${config.speed} | Quality: ${config.quality}\n`;
    output += `  ${config.description}\n\n`;
  }

  return output;
}

/**
 * Environment variable setup instructions
 */
export const SETUP_INSTRUCTIONS = `
# Model Configuration Setup

## Quick Start - Enable GPT-4 Mini for All Clients

Add these environment variables to your .env file:

\`\`\`env
# Use GPT-4 Mini globally (recommended for cost efficiency)
LLM_MODEL=gpt-4-mini
OPENROUTER_MODEL=openai/gpt-4-mini

# Or use Claude Haiku (cheaper, but slightly less capable)
# LLM_MODEL=claude-haiku
# OPENROUTER_MODEL=anthropic/claude-3.5-haiku

# Your OpenRouter API key
OPENROUTER_API_KEY=your_openrouter_key_here
\`\`\`

## For Vercel Deployment

Set these environment variables in Vercel dashboard:

1. Settings > Environment Variables
2. Add:
   - \`LLM_MODEL\` = \`gpt-4-mini\`
   - \`OPENROUTER_MODEL\` = \`openai/gpt-4-mini\`
   - \`OPENROUTER_API_KEY\` = your-key

3. Redeploy

## Model Selection Guide

### For Production (Cost-Conscious)
Use: \`claude-haiku\` - $0.08 per 1M tokens, fast, reliable

### For Production (Quality-Focused)  
Use: \`gpt-4-turbo\` - $10 per 1M tokens, very capable

### For Development
Use: \`gpt-4-mini\` - $0.15 per 1M tokens, good balance

### For Testing/High Volume
Use: \`claude-haiku\` - Cheapest option

## Cost Estimates

For 1000 requests with avg 500 input + 200 output tokens:
- Claude Haiku: ~\$0.56
- GPT-4 Mini: ~\$1.05
- GPT-4 Turbo: ~\$7.00

## Switching Models

### Dynamic at Runtime
\`\`\`typescript
import { getModelConfig } from './model-config';
const config = getModelConfig('claude-haiku');
\`\`\`

### Per Environment
\`\`\`bash
# Production
export LLM_MODEL=claude-haiku

# Staging
export LLM_MODEL=gpt-4-mini

# Development
export LLM_MODEL=gpt-4-turbo
\`\`\`

## Monitoring Costs

Track spending in OpenRouter dashboard:
https://openrouter.ai/keys

Budget recommendations:
- Development: $5-10/month
- Staging: $10-20/month
- Production: Based on usage (Monitor closely!)
`;
