import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  isLightXConfigured,
  generateHairstyle,
  LightXConfigError,
  tempImageStore,
} from "./server/lightxHairstyleService.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", true);

  // Handle large image payloads up to 30mb
  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ extended: true, limit: "30mb" }));

  // API: Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // API: Serve temporary image buffers for LightX external fetch if needed
  app.get("/api/temp-images/:id", (req, res) => {
    const item = tempImageStore.get(req.params.id);
    if (!item) {
      return res.status(404).send("Not found");
    }
    res.setHeader("Content-Type", item.mimeType || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=900");
    res.send(item.buffer);
  });

  // API: Configuration status
  app.get("/api/config-status", (_req, res) => {
    const configured = isLightXConfigured();
    res.json({
      configured,
      message: configured
        ? "LightX hairstyle service ready."
        : "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment.",
    });
  });

  // API: Generate single hairstyle via LightX
  app.post("/api/generate-hairstyle", async (req, res) => {
    try {
      const { image, hairstyle } = req.body;

      if (!image || !hairstyle) {
        return res.status(400).json({
          error: "Image and hairstyle name are required.",
        });
      }

      if (!isLightXConfigured()) {
        return res.status(503).json({
          notConfigured: true,
          error:
            "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment.",
        });
      }

      const host = req.get("host");
      const appBaseUrl =
        process.env.APP_URL || (host ? `${req.protocol}://${host}` : undefined);

      const result = await generateHairstyle(image, hairstyle, appBaseUrl);

      return res.json({
        success: true,
        hairstyle,
        imageUrl: result.imageUrl,
      });
    } catch (err: any) {
      console.error("Hairstyle generation error occurred.");

      const isConfigIssue =
        err instanceof LightXConfigError ||
        err?.isConfigError === true ||
        !isLightXConfigured();

      if (isConfigIssue) {
        return res.status(503).json({
          notConfigured: true,
          error:
            "LightX API is not configured. Please add LIGHTX_API_KEY to the server environment.",
        });
      }

      return res.status(500).json({
        error:
          "Unable to generate hairstyle preview right now. Please try again.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
