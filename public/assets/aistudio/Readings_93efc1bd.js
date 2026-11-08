import Reading from "../models/Readings.js";
import NumerologyProfile from "../models/NumerologyProfiles.js";
import { generarLecturaNumerologica, MODELO_GEMINI } from "../services/GeminiReading.js";


export const crearReading = async (req, res) => {
    try {
        const {
            prompt,
            respuesta,
            tipo_lectura,
            fecha
        } = req.body;

        const reading = await Reading.create({
            prompt,
            respuesta,
            tipo_lectura,
            fecha
        });

        res.status(201).json(reading);
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al crear lectura",
            error: error.message
        });
    }
};

export const generarReading = async (req, res, next) => {
    const { perfil_id, tipo_lectura } = req.body;

    try {
        const perfil = await NumerologyProfile.findOne({
            _id: perfil_id,
            usuario_id: req.usuario._id
        });

        if (!perfil) {
            return res.status(404).json({ mensaje: "Perfil numerológico no encontrado" });
        }

        const lecturaExistente = await Reading.findOne({
            usuario_id: req.usuario._id,
            perfil_id: perfil._id,
            tipo_lectura,
            modelo: MODELO_GEMINI
        });

        if (lecturaExistente) {
            return res.status(200).json({ ...lecturaExistente.toObject(), cache: true });
        }

        let resultado;
        try {
            resultado = await generarLecturaNumerologica(perfil, tipo_lectura);
        } catch (error) {
            console.error("Error al generar lectura con Gemini:", error);
            return res.status(503).json({
                mensaje: "No se pudo generar la lectura en este momento. Inténtalo de nuevo más tarde."
            });
        }

        const reading = await Reading.create({
            prompt: `Lectura numerológica: ${tipo_lectura}`,
            respuesta: resultado.datos,
            tipo_lectura,
            usuario_id: req.usuario._id,
            perfil_id: perfil._id,
            modelo: resultado.modelo,
            tokens_usados: resultado.tokens_usados
        });

        return res.status(201).json({ ...reading.toObject(), cache: false });
    } catch (error) {
        return next(error);
    }
};


export const listarReadings = async (req, res) => {
    try {
        const readings = await Reading.find();

        res.status(200).json(readings);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al listar lecturas",
            error: error.message
        });
    }
};


export const obtenerReading = async (req, res) => {
    try {
        const reading = await Reading.findById(req.params.id);

        if (!reading) {
            return res.status(404).json({
                mensaje: "Lectura no encontrada"
            });
        }

        res.status(200).json(reading);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener lectura",
            error: error.message
        });
    }
};


export const actualizarReading = async (req, res) => {
    try {
        const {
            prompt,
            respuesta,
            tipo_lectura,
            fecha
        } = req.body;

        const reading = await Reading.findByIdAndUpdate(
            req.params.id,
            {
                prompt,
                respuesta,
                tipo_lectura,
                fecha
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!reading) {
            return res.status(404).json({
                mensaje: "Lectura no encontrada"
            });
        }

        res.status(200).json(reading);
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al actualizar lectura",
            error: error.message
        });
    }
};


export const eliminarReading = async (req, res) => {
    try {
        const reading = await Reading.findByIdAndDelete(
            req.params.id
        );

        if (!reading) {
            return res.status(404).json({
                mensaje: "Lectura no encontrada"
            });
        }

        res.status(200).json({
            mensaje: "Lectura eliminada correctamente"
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar lectura",
            error: error.message
        });
    }
};

