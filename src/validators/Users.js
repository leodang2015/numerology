import { body, param } from "express-validator";

export const crearUserValidator = [
  body("nombre_completo")
    .trim()
    .notEmpty().withMessage("El nombre completo es obligatorio")
    .isLength({ min: 3, max: 100 }).withMessage("El nombre completo debe tener entre 3 y 100 caracteres"),

  body("email")
    .trim()
    .notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("Debe proporcionar un correo electrónico válido")
    .normalizeEmail(),

  body("password_hash")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("fecha_nacimiento")
    .notEmpty().withMessage("La fecha de nacimiento es obligatoria")
    .isISO8601().withMessage("La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)")
    .custom((valor) => {
      if (new Date(valor) > new Date()) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }
      return true;
    }),

  body("fecha_registro")
    .optional()
    .isISO8601().withMessage("La fecha de registro debe tener un formato ISO8601 válido")
];

export const loginUserValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("Debe proporcionar un correo electrónico válido")
    .normalizeEmail(),

  body("password_hash")
    .notEmpty().withMessage("La contraseña es obligatoria")
];

export const actualizarUserValidator = [
  body("nombre_completo")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El nombre completo debe tener entre 3 y 100 caracteres"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Debe proporcionar un correo electrónico válido")
    .normalizeEmail(),

  body("password_hash")
    .optional()
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("fecha_nacimiento")
    .optional()
    .isISO8601().withMessage("La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)")
    .custom((valor) => {
      if (new Date(valor) > new Date()) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }
      return true;
    }),

  body("fecha_registro")
    .optional()
    .isISO8601().withMessage("La fecha de registro debe tener un formato ISO8601 válido")
];

export const idValidator = [
  param("id")
    .isMongoId().withMessage("El id proporcionado no es un ObjectId válido de MongoDB")
];
