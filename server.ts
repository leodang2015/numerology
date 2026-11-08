import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./src/app.js";

async function startServer() {
  const PORT = process.env.PORT || 3000;

  // Integración con Vite para desarrollo y producción
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
