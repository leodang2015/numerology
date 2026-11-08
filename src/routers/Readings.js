import { Router } from "express";
import {
  crearReading,
  generarReading,
  listarReadings,
  obtenerReading,
  actualizarReading,
  eliminarReading
} from "../controllers/Readings.js";
import {
  crearReadingValidator,
  generarReadingValidator,
  actualizarReadingValidator,
  idValidator
} from "../validators/Readings.js";
import { validarCampos } from "../middlewares/validarCampos.js";
import { validarJWT } from "../middlewares/Webtoken.js";

const router = Router();

router.post("/generate", validarJWT, generarReadingValidator, validarCampos, generarReading);
router.get("/", listarReadings);
router.get("/:id", idValidator, validarCampos, obtenerReading);

router.post("/", validarJWT, crearReadingValidator, validarCampos, crearReading);
router.put("/:id", validarJWT, idValidator, actualizarReadingValidator, validarCampos, actualizarReading);
router.delete("/:id", validarJWT, idValidator, validarCampos, eliminarReading);

export default router;
