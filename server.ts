import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting server.ts...");
async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.get("/api/weather", async (req, res) => {
    console.log("Fetching weather data...");
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.9526&longitude=-75.1652&current_weather=true');
      console.log("Weather API response status:", response.status);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Server-side weather fetch failed:", error);
      res.status(500).json({ error: "Failed to fetch weather" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
