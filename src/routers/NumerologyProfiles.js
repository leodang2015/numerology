import { Router } from "express";
import { 
  crearNumerologyProfile, 
  listarNumerologyProfiles, 
  obtenerNumerologyProfile, 
  actualizarNumerologyProfile, 
  eliminarNumerologyProfile 
} from "../controllers/NumerologyProfiles.js";
import { 
  crearNumerologyProfileValidator, 
  actualizarNumerologyProfileValidator, 
  idValidator 
} from "../validators/NumerologyProfiles.js";
import { validarCampos } from "../middlewares/validarCampos.js";
import { validarJWT } from "../middlewares/Webtoken.js";

const router = Router();

router.get("/", listarNumerologyProfiles);
router.get("/:id", idValidator, validarCampos, obtenerNumerologyProfile);

router.post("/", validarJWT, crearNumerologyProfileValidator, validarCampos, crearNumerologyProfile);
router.put("/:id", validarJWT, idValidator, actualizarNumerologyProfileValidator, validarCampos, actualizarNumerologyProfile);
router.delete("/:id", validarJWT, idValidator, validarCampos, eliminarNumerologyProfile);

export default router;
