import { body, param } from "express-validator";

export const crearNumerologyProfileValidator = [
  body("usuario_id")
    .notEmpty().withMessage("El usuario_id es obligatorio")
    .isMongoId().withMessage("El usuario_id debe ser un ObjectId de MongoDB válido"),

  body("numero_vida")
    .notEmpty().withMessage("El número de vida es obligatorio")
    .isInt({ min: 1 }).withMessage("El número de vida debe ser un entero mayor o igual a 1"),

  body("numero_expresion")
    .notEmpty().withMessage("El número de expresión es obligatorio")
    .isInt({ min: 1 }).withMessage("El número de expresión debe ser un entero mayor o igual a 1"),

  body("numero_alma")
    .notEmpty().withMessage("El número de alma es obligatorio")
    .isInt({ min: 1 }).withMessage("El número de alma debe ser un entero mayor o igual a 1")
];

export const actualizarNumerologyProfileValidator = [
  body("usuario_id")
    .optional()
    .isMongoId().withMessage("El usuario_id debe ser un ObjectId de MongoDB válido"),

  body("numero_vida")
    .optional()
    .isInt({ min: 1 }).withMessage("El número de vida debe ser un entero mayor o igual a 1"),

  body("numero_expresion")
    .optional()
    .isInt({ min: 1 }).withMessage("El número de expresión debe ser un entero mayor o igual a 1"),

  body("numero_alma")
    .optional()
    .isInt({ min: 1 }).withMessage("El número de alma debe ser un entero mayor o igual a 1")
];

export const idValidator = [
  param("id")
    .isMongoId().withMessage("El id proporcionado no es un ObjectId válido de MongoDB")
];
