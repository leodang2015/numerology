import { validationResult } from "express-validator";

export const validarCampos = (req, res, next) => {
const errores = validationResult(req);
if (!errores.isEmpty()) {

return res.status(400).json({
mensaje: "Error de validación",
errores: errores.array().map((err) => ({
campo: err.path,
mensaje: err.msg,
})),
});
}
next();
};
