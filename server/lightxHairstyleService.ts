import { randomUUID } from "crypto";

export interface GenerateHairstyleResult {
  imageUrl: string;
}

export class LightXConfigError extends Error {
  isConfigError = true;
  constructor(
    message = "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment."
  ) {
    super(message);
    this.name = "LightXConfigError";
  }
}

export class LightXGenerationError extends Error {
  isGenerationError = true;
  constructor(
    message = "Unable to generate hairstyle preview right now. Please try again."
  ) {
    super(message);
    this.name = "LightXGenerationError";
  }
}

// In-memory store for temporary serving of uploaded base64 photos to LightX
export const tempImageStore = new Map<
  string,
  { buffer: Buffer; mimeType: string; createdAt: number }
>();

// Periodically clean up temp images older than 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of tempImageStore.entries()) {
    if (now - item.createdAt > 15 * 60 * 1000) {
      tempImageStore.delete(id);
    }
  }
}, 60 * 1000);

/**
 * Check if the LightX API key is set in environment
 */
export function isLightXConfigured(): boolean {
  const key = process.env.LIGHTX_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Build the exact prompt for preserving face/identity and modifying only the hairstyle
 */
export function buildHairstylePrompt(hairstyleName: string): string {
  return `Edit this exact photograph. Preserve the same person's identity, facial features, facial structure, skin appearance, pose, clothing, camera angle, background and lighting as closely as possible. Change primarily the person's hairstyle to ${hairstyleName}. Make the hairstyle realistic, naturally connected to the existing hairline and head shape, with realistic texture, volume, shadows and hair strands. Do not replace the person's face. Do not create a different person. Do not make unnecessary changes to the photograph.`;
}

/**
 * Upload image buffer to a temporary public host so external APIs like LightX can access it
 * without being blocked by container authentication or cookies.
 */
async function uploadToPublicTempHost(
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  try {
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const blob = new Blob([buffer], { type: mimeType });
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("time", "1h");
    form.append("fileToUpload", blob, `user_photo.${ext}`);

    const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith("http")) {
        return url;
      }
    }
  } catch {
    // Fallback gracefully if public host is unreachable
  }
  return null;
}

/**
 * Helper to register base64 image and obtain a public/accessible URL
 */
export function registerTempImage(dataUrl: string, baseUrl?: string): string {
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }

  const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return dataUrl;
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const id = randomUUID();

  tempImageStore.set(id, {
    buffer,
    mimeType,
    createdAt: Date.now(),
  });

  const base = baseUrl || process.env.APP_URL || "";
  if (base) {
    return `${base.replace(/\/$/, "")}/api/temp-images/${id}`;
  }

  return dataUrl;
}

/**
 * Poll the order status if LightX returns an asynchronous orderId
 */
async function pollOrderStatus(
  orderId: string,
  apiKey: string,
  maxAttempts = 35,
  intervalMs = 2500
): Promise<string | null> {
  const statusEndpoint = "https://api.lightxeditor.com/external/api/v1/order-status";

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    try {
      const res = await fetch(statusEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) continue;

      const data = await res.json();

      // Check direct body.output
      if (
        data?.body?.output &&
        typeof data.body.output === "string" &&
        data.body.output.startsWith("http")
      ) {
        return data.body.output;
      }

      const outputUrl = extractOutputImageUrl(data);
      if (outputUrl) {
        return outputUrl;
      }

      // Check status flags if present
      const status = (data?.body?.status || data?.status || "").toLowerCase();
      if (status === "failed" || status === "error") {
        return null;
      }
    } catch {
      // Continue polling until timeout
    }
  }

  return null;
}

/**
 * Safely extract the generated image URL from any LightX API response structure
 */
function extractOutputImageUrl(data: any): string | null {
  if (!data || typeof data !== "object") return null;

  // Direct candidates
  const candidates = [
    data.body?.output,
    data.output,
    data.outputUrl,
    data.imageUrl,
    data.output_url,
    data.result,
    data.data?.output,
    data.data?.imageUrl,
    data.data?.outputUrl,
    data.body?.outputUrl,
    data.body?.imageUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.startsWith("http")) {
      return candidate;
    }
  }

  // Deep recursive search for any https URL string ending with image format or on CDN
  const visited = new Set();
  function search(obj: any): string | null {
    if (!obj || typeof obj !== "object" || visited.has(obj)) return null;
    visited.add(obj);

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "string") {
        if (
          val.startsWith("http") &&
          (val.includes(".png") ||
            val.includes(".jpg") ||
            val.includes(".jpeg") ||
            val.includes(".webp") ||
            val.includes("lightx") ||
            val.includes("cdn") ||
            val.includes("output"))
        ) {
          return val;
        }
      } else if (typeof val === "object") {
        const found = search(val);
        if (found) return found;
      }
    }
    return null;
  }

  return search(data);
}

/**
 * Main LightX Hairstyle service function:
 * Sends the user image and requested hairstyle to LightX Hairstyle API
 */
export async function generateHairstyle(
  image: string,
  hairstyle: string,
  appBaseUrl?: string
): Promise<GenerateHairstyleResult> {
  const apiKey = process.env.LIGHTX_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new LightXConfigError(
      "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment."
    );
  }

  const prompt = buildHairstylePrompt(hairstyle);
  let resolvedImageUrl = image;

  if (image.startsWith("data:")) {
    const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      const publicUrl = await uploadToPublicTempHost(buffer, mimeType);
      if (publicUrl) {
        resolvedImageUrl = publicUrl;
      } else {
        resolvedImageUrl = registerTempImage(image, appBaseUrl);
      }
    } else {
      resolvedImageUrl = registerTempImage(image, appBaseUrl);
    }
  } else if (!image.startsWith("http://") && !image.startsWith("https://")) {
    resolvedImageUrl = registerTempImage(image, appBaseUrl);
  }

  const endpoint = "https://api.lightxeditor.com/external/api/v1/hairstyle";

  const payload = {
    imageUrl: resolvedImageUrl,
    textPrompt: prompt,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey.trim(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // API key unauthorized or forbidden
        console.error("LightX API authorization failed (401/403).");
        throw new LightXConfigError(
          "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment."
        );
      }

      console.error(`LightX API returned status ${response.status}`);
      throw new LightXGenerationError(
        "Unable to generate hairstyle preview right now. Please try again."
      );
    }

    const data = await response.json();

    // Check if synchronous output was returned directly
    let resultUrl = extractOutputImageUrl(data);

    // If orderId returned, poll for completion
    const orderId = data.orderId || data.body?.orderId || data.data?.orderId;
    if (!resultUrl && orderId) {
      resultUrl = await pollOrderStatus(orderId, apiKey.trim());
    }

    if (!resultUrl) {
      console.error("No image URL returned from LightX API response.");
      throw new LightXGenerationError(
        "Unable to generate hairstyle preview right now. Please try again."
      );
    }

    return {
      imageUrl: resultUrl,
    };
  } catch (error: any) {
    // If it's already a clean typed error, rethrow
    if (error instanceof LightXConfigError || error instanceof LightXGenerationError) {
      throw error;
    }

    // Do not log or expose raw API errors or API keys
    console.error("LightX request failed safely.");
    throw new LightXGenerationError(
      "Unable to generate hairstyle preview right now. Please try again."
    );
  }
}
