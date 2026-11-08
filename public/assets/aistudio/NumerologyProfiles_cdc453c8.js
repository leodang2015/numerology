import NumerologyProfile from "../models/NumerologyProfiles.js";


export const listarNumerologyProfiles = async (req, res, next) => {
    try {
        const perfiles = await NumerologyProfile.find().populate("usuario_id");
        res.status(200).json(perfiles);
    } catch (error) {
        next(error);
    }
};


export const obtenerNumerologyProfile = async (req, res, next) => {
    try {
        const perfil = await NumerologyProfile.findById(req.params.id).populate("usuario_id");
        if (!perfil) {
            return res.status(404).json({ mensaje: "Perfil numerológico no encontrado" });
        }
        res.status(200).json(perfil);
    } catch (error) {
        next(error);
    }
};


export const crearNumerologyProfile = async (req, res, next) => {
    try {
        const nuevoPerfil = new NumerologyProfile(req.body);
        const perfilGuardado = await nuevoPerfil.save();
        res.status(201).json(perfilGuardado);
    } catch (error) {
        next(error);
    }
};

export const actualizarNumerologyProfile = async (req, res, next) => {
    try {
        const perfilActualizado = await NumerologyProfile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!perfilActualizado) {
            return res.status(404).json({ mensaje: "Perfil numerológico no encontrado" });
        }
        res.status(200).json(perfilActualizado);
    } catch (error) {
        next(error);
    }
};

export const eliminarNumerologyProfile = async (req, res, next) => {
    try {
        const perfilEliminado = await NumerologyProfile.findByIdAndDelete(req.params.id);
        if (!perfilEliminado) {
            return res.status(404).json({ mensaje: "Perfil numerológico no encontrado" });
        }
        res.status(200).json({ mensaje: "Perfil numerológico eliminado correctamente" });
    } catch (error) {
        next(error);
    }
};