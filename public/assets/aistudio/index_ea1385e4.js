import "dotenv/config";

import express from "express";
import { x } from "./src/DataBase/cnxmongo.js";

// Importación de rutas
import UsersRoutes from "./src/routers/Users.js";
import NumerologyProfilesRoutes from "./src/routers/NumerologyProfiles.js";
import CompatibilityMatchesRoutes from "./src/routers/CompatibilityMatches.js";
import ReadingsRoutes from "./src/routers/Readings.js";
import AuditLogsRoutes from "./src/routers/AuditLogs.js";

const app = express();
const PORT = process.env.PORT || 1799; 


app.use(express.json());


app.use("/api/v1/users", UsersRoutes);
app.use("/api/v1/numerology-profiles", NumerologyProfilesRoutes);
app.use("/api/v1/compatibility-matches", CompatibilityMatchesRoutes);
app.use("/api/v1/readings", ReadingsRoutes);
app.use("/api/v1/audit-logs", AuditLogsRoutes);

app.use((req, res) => {
    res.status(404).json({
        mensaje: "La ruta o método solicitado no existe en el servidor"
    });
});

app.use((err, req, res, next) => {
    console.error("🔥 Error no controlado:", err.stack);
    res.status(500).json({
        mensaje: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});


x().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("Error crítico al iniciar la base de datos:", error);
});