import mongoose from "mongoose";

const compatibilityMatchSchema = new mongoose.Schema(
    {
        usuario_id_1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "El usuario_id_1 es obligatorio"],
        },
        usuario_id_2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "El usuario_id_2 es obligatorio"],
        },
        puntaje_calculado: {
            type: Number,
            required: [true, "El puntaje calculado es obligatorio"],
            min: [0, "El puntaje mínimo es 0"],
            max: [100, "El puntaje máximo es 100"],
        },
        interpretacion_ia: {
            type: String,
            required: [true, "La interpretación de la IA es obligatoria"],
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("CompatibilityMatch", compatibilityMatchSchema);