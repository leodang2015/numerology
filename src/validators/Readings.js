import { body, param } from "express-validator";

export const crearReadingValidator = [
  body("prompt")
    .trim()
    .notEmpty().withMessage("El prompt es obligatorio")
    .isString().withMessage("El prompt debe ser una cadena de texto"),

  body("respuesta")
    .trim()
    .notEmpty().withMessage("La respuesta es obligatoria")
    .isString().withMessage("La respuesta debe ser una cadena de texto"),

  body("tipo_lectura")
    .trim()
    .notEmpty().withMessage("El tipo de lectura es obligatorio")
    .isString().withMessage("El tipo de lectura debe ser una cadena de texto"),

  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe tener un formato ISO8601 válido")
];

export const actualizarReadingValidator = [
  body("prompt")
    .optional()
    .trim()
    .isString().withMessage("El prompt debe ser una cadena de texto"),

  body("respuesta")
    .optional()
    .trim()
    .isString().withMessage("La respuesta debe ser una cadena de texto"),

  body("tipo_lectura")
    .optional()
    .trim()
    .isString().withMessage("El tipo de lectura debe ser una cadena de texto"),

  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe tener un formato ISO8601 válido")
];

export const idValidator = [
  param("id")
    .isMongoId().withMessage("El id proporcionado no es un ObjectId válido de MongoDB")
];

export const generarReadingValidator = [
  body("perfil_id")
    .isMongoId().withMessage("El perfil_id debe ser un ObjectId válido"),

  body("tipo_lectura")
    .trim()
    .isIn(["general", "amor", "trabajo", "proposito"])
    .withMessage("El tipo de lectura debe ser general, amor, trabajo o proposito")
];
