import AuditLog from "../models/AuditLogs.js";


export const crearAuditLog = async (req, res) => {
    try {
        const {
            endpoint,
            metodo,
            status_code,
            timestamp,
            user_id
        } = req.body;

        const auditLog = await AuditLog.create({
            endpoint,
            metodo,
            status_code,
            timestamp,
            user_id
        });

        res.status(201).json(auditLog);
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al crear registro de auditoría",
            error: error.message
        });
    }
};


export const listarAuditLogs = async (req, res) => {
    try {
        const auditLogs = await AuditLog.find();

        res.status(200).json(auditLogs);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al listar registros de auditoría",
            error: error.message
        });
    }
};


export const obtenerAuditLog = async (req, res) => {
    try {
        const auditLog = await AuditLog.findById(req.params.id);

        if (!auditLog) {
            return res.status(404).json({
                mensaje: "Registro de auditoría no encontrado"
            });
        }

        res.status(200).json(auditLog);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener registro de auditoría",
            error: error.message
        });
    }
};


export const actualizarAuditLog = async (req, res) => {
    try {
        const {
            endpoint,
            metodo,
            status_code,
            timestamp,
            user_id
        } = req.body;

        const auditLog = await AuditLog.findByIdAndUpdate(
            req.params.id,
            {
                endpoint,
                metodo,
                status_code,
                timestamp,
                user_id
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!auditLog) {
            return res.status(404).json({
                mensaje: "Registro de auditoría no encontrado"
            });
        }

        res.status(200).json(auditLog);
    } catch (error) {
        res.status(400).json({
            mensaje: "Error al actualizar registro de auditoría",
            error: error.message
        });
    }
};


export const eliminarAuditLog = async (req, res) => {
    try {
        const auditLog = await AuditLog.findByIdAndDelete(
            req.params.id
        );

        if (!auditLog) {
            return res.status(404).json({
                mensaje: "Registro de auditoría no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Registro de auditoría eliminado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar registro de auditoría",
            error: error.message
        });
    }
};

