import { GoogleGenAI } from "@google/genai";

export interface GenerateResult {
  imageUrl: string;
}

export class ApiConfigError extends Error {
  isConfigError = true;
  constructor(message: string = "AI hairstyle preview is not configured yet. Please connect the image-generation API.") {
    super(message);
    this.name = "ApiConfigError";
  }
}

export function isAiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== "MY_GEMINI_API_KEY");
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey === "MY_GEMINI_API_KEY") {
    throw new ApiConfigError("AI hairstyle preview is not configured yet. Please connect the image-generation API.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export async function generateHairstyle(
  base64Image: string,
  mimeType: string,
  hairstyleName: string
): Promise<GenerateResult> {
  if (!isAiConfigured()) {
    throw new Error("AI hairstyle preview is not configured yet. Please connect the image-generation API.");
  }

  const ai = getAiClient();

  // Strip possible data URI prefix if passed
  let cleanBase64 = base64Image;
  let cleanMimeType = mimeType || "image/jpeg";

  if (base64Image.includes(",")) {
    const parts = base64Image.split(",");
    const match = parts[0].match(/data:(.*?);base64/);
    if (match && match[1]) {
      cleanMimeType = match[1];
    }
    cleanBase64 = parts[1];
  }

  // Exact prompt instruction adhering to section 5 of the requirements
  const prompt = `Edit this exact photograph. Preserve the same person's identity, facial features, facial structure, skin appearance, pose, clothing, camera angle, background and lighting as closely as possible. Change primarily the person's hairstyle to ${hairstyleName}. Make the hairstyle realistic, naturally connected to the existing hairline and head shape, with realistic texture, volume, shadows and hair strands. Do not replace the person's face. Do not create a different person. Do not make unnecessary changes to the photograph.`;

  const modelsToTry = [
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: cleanMimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const outMime = part.inlineData.mimeType || "image/png";
          return {
            imageUrl: `data:${outMime};base64,${part.inlineData.data}`,
          };
        }
      }

      // If no inlineData image part, continue to check if there is an error
      if (parts.length > 0 && parts[0].text) {
        lastError = new Error(parts[0].text);
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = typeof err?.message === "string" ? err.message : JSON.stringify(err);
      console.warn(`Model ${modelName} attempt failed:`, errMsg);

      // Detect quota / free tier limits or billing requirement
      const isQuotaOrPaidRequirement =
        err?.status === "RESOURCE_EXHAUSTED" ||
        err?.status === 429 ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("Quota exceeded") ||
        errMsg.includes("limit: 0") ||
        errMsg.includes("free_tier");

      if (isQuotaOrPaidRequirement) {
        throw new ApiConfigError(
          "AI hairstyle preview is not configured yet. Please connect the image-generation API."
        );
      }
    }
  }

  const finalMsg = typeof lastError?.message === "string" ? lastError.message : JSON.stringify(lastError);
  if (
    lastError?.status === "RESOURCE_EXHAUSTED" ||
    lastError?.status === 429 ||
    finalMsg.includes("429") ||
    finalMsg.includes("Quota exceeded") ||
    finalMsg.includes("limit: 0")
  ) {
    throw new ApiConfigError(
      "AI hairstyle preview is not configured yet. Please connect the image-generation API."
    );
  }

  throw lastError || new Error("Failed to generate hairstyle image with AI service.");
}
