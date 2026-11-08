import "dotenv/config";
import app from "./src/app.js";
import { x } from "./src/DataBase/cnxmongo.js";

const PORT = process.env.PORT || 1799; 

x().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("Error crítico al iniciar la base de datos:", error);
});
