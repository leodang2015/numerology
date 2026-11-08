import CompatibilityMatch from "../models/CompatibilityMatches.js";
import NumerologyProfile from "../models/NumerologyProfiles.js";
import { generarCompatibilidadNumerologica } from "../services/GeminiCompatibility.js";


export const generarCompatibilityMatch = async (req, res, next) => {
    const { perfil_id_propio, perfil_id_compatibilidad } = req.body;

    try {
        const [perfilPropio, perfilCompatibilidad] = await Promise.all([
            NumerologyProfile.findOne({
                _id: perfil_id_propio,
                usuario_id: req.usuario._id
            }),
            NumerologyProfile.findById(perfil_id_compatibilidad)
        ]);

        if (!perfilPropio) {
            return res.status(404).json({
                mensaje: "Tu perfil numerológico no fue encontrado"
            });
        }

        if (!perfilCompatibilidad) {
            return res.status(404).json({
                mensaje: "El perfil de compatibilidad no fue encontrado"
            });
        }

        if (String(perfilPropio.usuario_id) === String(perfilCompatibilidad.usuario_id)) {
            return res.status(400).json({
                mensaje: "La compatibilidad requiere perfiles de usuarios distintos"
            });
        }

        let resultado;
        try {
            resultado = await generarCompatibilidadNumerologica(perfilPropio, perfilCompatibilidad);
        } catch (error) {
            console.error("Error al generar compatibilidad con Gemini:", error);
            return res.status(503).json({
                mensaje: "No se pudo generar la compatibilidad en este momento. Inténtalo de nuevo más tarde."
            });
        }

        const compatibilityMatch = await CompatibilityMatch.create({
            usuario_id_1: perfilPropio.usuario_id,
            usuario_id_2: perfilCompatibilidad.usuario_id,
            puntaje_calculado: resultado.puntaje_calculado,
            interpretacion_ia: resultado.interpretacion_ia
        });

        return res.status(201).json(compatibilityMatch);
    } catch (error) {
        return next(error);
    }
};

export const crearCompatibilityMatch = async (req, res) => {
    try {
        const {
            usuario_id_1,
            usuario_id_2,
            puntaje_calculado,
            interpretacion_ia
        } = req.body;

        const compatibilityMatch = await CompatibilityMatch.create({
            usuario_id_1,
            usuario_id_2,
            puntaje_calculado,
            interpretacion_ia
        });

        res.status(201).json(compatibilityMatch);
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al crear análisis de compatibilidad",
            error: error.message
        });
    }
};


export const listarCompatibilityMatches = async (req, res) => {
    try {
        const compatibilityMatches = await CompatibilityMatch.find();

        res.status(200).json(compatibilityMatches);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al listar análisis de compatibilidad",
            error: error.message
        });
    }
};


export const obtenerCompatibilityMatch = async (req, res) => {
    try {
        const compatibilityMatch = await CompatibilityMatch.findById(req.params.id);

        if (!compatibilityMatch) {
            return res.status(404).json({
                mensaje: "Análisis de compatibilidad no encontrado"
            });
        }

        res.status(200).json(compatibilityMatch);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener análisis de compatibilidad",
            error: error.message
        });
    }
};


export const actualizarCompatibilityMatch = async (req, res) => {
    try {
        const {
            usuario_id_1,
            usuario_id_2,
            puntaje_calculado,
            interpretacion_ia
        } = req.body;

        const compatibilityMatch = await CompatibilityMatch.findByIdAndUpdate(
            req.params.id,
            {
                usuario_id_1,
                usuario_id_2,
                puntaje_calculado,
                interpretacion_ia
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!compatibilityMatch) {
            return res.status(404).json({
                mensaje: "Análisis de compatibilidad no encontrado"
            });
        }

        res.status(200).json(compatibilityMatch);
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al actualizar análisis de compatibilidad",
            error: error.message
        });
    }
};


export const eliminarCompatibilityMatch = async (req, res) => {
    try {
        const compatibilityMatch = await CompatibilityMatch.findByIdAndDelete(
            req.params.id
        );

        if (!compatibilityMatch) {
            return res.status(404).json({
                mensaje: "Análisis de compatibilidad no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Análisis de compatibilidad eliminado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar análisis de compatibilidad",
            error: error.message
        });
    }
};
