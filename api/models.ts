import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AVAILABLE_MODELS, getModelConfig, formatModelsList, estimateCost } from "../src/model-config";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // GET /api/models - List all available models
    if (req.method === "GET") {
      const action = req.query.action as string;

      if (action === "list") {
        return res.status(200).json({
          success: true,
          models: AVAILABLE_MODELS,
          current: {
            model: process.env.LLM_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-4-mini",
            config: getModelConfig(),
          },
          formattedList: formatModelsList(),
        });
      }

      if (action === "current") {
        const currentModel = process.env.LLM_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-4-mini";
        return res.status(200).json({
          success: true,
          model: currentModel,
          config: getModelConfig(),
        });
      }

      if (action === "estimate") {
        const { modelName, inputTokens = 500, outputTokens = 200 } = req.query;
        const cost = estimateCost(
          modelName as string,
          Number(inputTokens),
          Number(outputTokens)
        );
        return res.status(200).json({
          success: true,
          model: modelName,
          inputTokens: Number(inputTokens),
          outputTokens: Number(outputTokens),
          estimatedCost: `$${cost.toFixed(4)}`,
          costPer1M: `$${(cost * 2000).toFixed(2)}`,
        });
      }

      // Default: return available models
      return res.status(200).json({
        success: true,
        models: AVAILABLE_MODELS,
        current: {
          model: process.env.LLM_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-4-mini",
          config: getModelConfig(),
        },
        endpoints: {
          list: "/api/models?action=list",
          current: "/api/models?action=current",
          estimate: "/api/models?action=estimate&modelName=gpt-4-mini&inputTokens=500&outputTokens=200",
        },
      });
    }

    // POST /api/models - Get specific model info
    if (req.method === "POST") {
      const { modelName, action } = req.body;

      if (action === "getConfig") {
        const config = getModelConfig(modelName);
        return res.status(200).json({
          success: true,
          model: modelName,
          config,
        });
      }

      if (action === "estimateCost") {
        const { inputTokens = 500, outputTokens = 200 } = req.body;
        const cost = estimateCost(modelName, inputTokens, outputTokens);
        return res.status(200).json({
          success: true,
          model: modelName,
          inputTokens,
          outputTokens,
          estimatedCost: `$${cost.toFixed(4)}`,
          costPerMillionTokens: `$${(cost * 2000).toFixed(2)}`,
        });
      }

      return res.status(400).json({
        success: false,
        error: "Invalid action",
        availableActions: ["getConfig", "estimateCost"],
      });
    }

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Model config error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
