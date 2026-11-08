import { body, param } from "express-validator";
import User from "../models/Users.js"; 

export const crearCompatibilityMatchValidator = [
  body("usuario_id_1")
    .notEmpty().withMessage("El usuario_id_1 es obligatorio")
    .isMongoId().withMessage("El usuario_id_1 debe ser un ObjectId de MongoDB válido")
    .custom(async (id) => {
      const userExists = await User.findById(id);
      if (!userExists) {
        throw new Error("El usuario_id_1 referenciado no existe");
      }
    }),

  body("usuario_id_2")
    .notEmpty().withMessage("El usuario_id_2 es obligatorio")
    .isMongoId().withMessage("El usuario_id_2 debe ser un ObjectId de MongoDB válido")
    .custom((valor, { req }) => {
      if (valor === req.body.usuario_id_1) {
        throw new Error("El usuario_id_2 no puede ser igual al usuario_id_1");
      }
      return true;
    })
    .custom(async (id) => {
      const userExists = await User.findById(id);
      if (!userExists) {
        throw new Error("El usuario_id_2 referenciado no existe");
      }
    }),

  body("puntaje_calculado")
    .notEmpty().withMessage("El puntaje calculado es obligatorio")
    .isFloat({ min: 0, max: 100 }).withMessage("El puntaje debe ser un número entre 0 y 100"),

  body("interpretacion_ia")
    .trim()
    .notEmpty().withMessage("La interpretación de la IA es obligatoria")
    .isString().withMessage("La interpretación debe ser una cadena de texto")
];

export const actualizarCompatibilityMatchValidator = [
  body("usuario_id_1")
    .optional()
    .isMongoId().withMessage("El usuario_id_1 debe ser un ObjectId de MongoDB válido")
    .custom(async (id) => {
      if (id) {
        const userExists = await User.findById(id);
        if (!userExists) {
          throw new Error("El usuario_id_1 referenciado no existe");
        }
      }
    }),

  body("usuario_id_2")
    .optional()
    .isMongoId().withMessage("El usuario_id_2 debe ser un ObjectId de MongoDB válido")
    .custom((valor, { req }) => {
      if (req.body.usuario_id_1 && valor === req.body.usuario_id_1) {
        throw new Error("El usuario_id_2 no puede ser igual al usuario_id_1");
      }
      return true;
    })
    .custom(async (id) => {
      if (id) {
        const userExists = await User.findById(id);
        if (!userExists) {
          throw new Error("El usuario_id_2 referenciado no existe");
        }
      }
    }),

  body("puntaje_calculado")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("El puntaje debe ser un número entre 0 y 100"),

  body("interpretacion_ia")
    .optional()
    .trim()
    .isString().withMessage("La interpretación debe ser una cadena de texto")
];

export const generarCompatibilityMatchValidator = [
  body("perfil_id_propio")
    .notEmpty().withMessage("El perfil_id_propio es obligatorio")
    .isMongoId().withMessage("El perfil_id_propio debe ser un ObjectId válido"),

  body("perfil_id_compatibilidad")
    .notEmpty().withMessage("El perfil_id_compatibilidad es obligatorio")
    .isMongoId().withMessage("El perfil_id_compatibilidad debe ser un ObjectId válido")
    .custom((valor, { req }) => {
      if (valor === req.body.perfil_id_propio) {
        throw new Error("No se puede analizar un perfil consigo mismo");
      }
      return true;
    })
];

export const idValidator = [
  param("id")
    .isMongoId().withMessage("El id proporcionado no es un ObjectId válido de MongoDB")
];
