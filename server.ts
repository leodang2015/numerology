import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { x } from "./src/DataBase/cnxmongo.js";

// Importación de routers
import UsersRoutes from "./src/routers/Users.js";
import NumerologyProfilesRoutes from "./src/routers/NumerologyProfiles.js";
import CompatibilityMatchesRoutes from "./src/routers/CompatibilityMatches.js";
import ReadingsRoutes from "./src/routers/Readings.js";
import AuditLogsRoutes from "./src/routers/AuditLogs.js";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Conexión asíncrona a MongoDB
  x().catch((err: any) => {
    console.error("Aviso: Conexión a MongoDB:", err?.message || err);
  });

  // Estado del servicio
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "online",
      servicio: "API de Numerología e IA",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  });

  // Montar rutas de la API bajo /api/v1
  app.use("/api/v1/users", UsersRoutes);
  app.use("/api/v1/numerology-profiles", NumerologyProfilesRoutes);
  app.use("/api/v1/compatibility-matches", CompatibilityMatchesRoutes);
  app.use("/api/v1/readings", ReadingsRoutes);
  app.use("/api/v1/audit-logs", AuditLogsRoutes);

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
