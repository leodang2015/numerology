import { body, param } from "express-validator";

export const crearAuditLogValidator = [
  body("endpoint")
    .trim()
    .notEmpty()
    .withMessage("El endpoint es obligatorio")
    .isString()
    .withMessage("El endpoint debe ser una cadena de texto"),

  body("metodo")
    .trim()
    .notEmpty()
    .withMessage("El método HTTP es obligatorio")
    .toUpperCase()
    .isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])
    .withMessage(
      "El método HTTP no es válido (debe ser GET, POST, PUT, PATCH o DELETE)",
    ),

  body("status_code")
    .notEmpty()
    .withMessage("El status code es obligatorio")
    .isInt({ min: 100, max: 599 })
    .withMessage("El status code debe ser un número entero válido (100-599)"),

  body("timestamp")
    .optional()
    .isISO8601()
    .withMessage("La fecha timestamp debe tener un formato ISO8601 válido"),

  body("user_id")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("El user_id debe ser un ObjectId de MongoDB válido"),
];

export const actualizarAuditLogValidator = [
  body("endpoint")
    .optional()
    .trim()
    .isString()
    .withMessage("El endpoint debe ser una cadena de texto"),

  body("metodo")
    .optional()
    .trim()
    .toUpperCase()
    .isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])
    .withMessage("El método HTTP no es válido"),

  body("status_code")
    .optional()
    .isInt({ min: 100, max: 599 })
    .withMessage("El status code debe ser un número entero válido (100-599)"),

  body("timestamp")
    .optional()
    .isISO8601()
    .withMessage("La fecha timestamp debe tener un formato ISO8601 válido"),

  body("user_id")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("El user_id debe ser un ObjectId de MongoDB válido"),
];

// Regla para validar los ID de MongoDB recibidos por URL
export const idValidator = [
  param("id")
    .isMongoId()
    .withMessage("El id proporcionado no es un ObjectId válido de MongoDB"),
];
