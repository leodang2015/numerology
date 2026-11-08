import "dotenv/config";
import express from "express";
import { x } from "./DataBase/cnxmongo.js";

// Importación de rutas
import UsersRoutes from "./routers/Users.js";
import NumerologyProfilesRoutes from "./routers/NumerologyProfiles.js";
import CompatibilityMatchesRoutes from "./routers/CompatibilityMatches.js";
import ReadingsRoutes from "./routers/Readings.js";
import AuditLogsRoutes from "./routers/AuditLogs.js";

const app = express();

app.use(express.json());

// Middleware para asegurar conexión a MongoDB en cada invocación (esencial para Vercel Serverless)
app.use(async (req, res, next) => {
    try {
        await x();
    } catch (error) {
        console.error("Aviso MongoDB:", error.message);
    }
    next();
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
    res.json({
        status: "online",
        servicio: "API de Numerología e IA",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API v1
app.use("/api/v1/users", UsersRoutes);
app.use("/api/v1/numerology-profiles", NumerologyProfilesRoutes);
app.use("/api/v1/compatibility-matches", CompatibilityMatchesRoutes);
app.use("/api/v1/readings", ReadingsRoutes);
app.use("/api/v1/audit-logs", AuditLogsRoutes);

export default app;
