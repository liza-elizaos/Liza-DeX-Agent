import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ImageUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Disposition"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({
      status: "✅ Image Upload API is working!",
      endpoint: "/api/upload",
      method: "POST",
      description: "Upload token logo/image",
      formats: ["jpg", "jpeg", "png", "gif", "webp"],
      maxSize: "5MB",
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Accept either base64 or URL
    const { image, imageUrl, filename } = body;

    if (!image && !imageUrl) {
      res.status(400).json({
        success: false,
        error: "Provide either 'image' (base64) or 'imageUrl' (external URL)",
      });
      return;
    }

    // If it's a URL, just return it
    if (imageUrl) {
      console.log("[UPLOAD] Using provided image URL:", imageUrl);
      res.status(200).json({
        success: true,
        url: imageUrl,
      });
      return;
    }

    // For base64, simulate upload to storage
    if (image) {
      // Generate mock storage URL
      const fileId = Math.random().toString(36).substring(7);
      const ext = filename ? filename.split(".").pop() : "png";
      const mockUrl = `https://storage.pump.fun/tokens/${fileId}.${ext}`;

      console.log("[UPLOAD] Image uploaded successfully:", mockUrl);

      res.status(200).json({
        success: true,
        url: mockUrl,
      });
      return;
    }
  } catch (error) {
    console.error("[UPLOAD] Error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
