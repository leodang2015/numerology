import mongoose from "mongoose";

const readingSchema = new mongoose.Schema(
    {
        prompt: {
            type: String,
            required: [true, "El prompt es obligatorio"],
            trim: true,
        },
        respuesta: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "La respuesta es obligatoria"],
        },
        tipo_lectura: {
            type: String,
            required: [true, "El tipo de lectura es obligatorio"],
            trim: true,
        },
        fecha: {
            type: Date,
            default: Date.now,
        },
        usuario_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        perfil_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NumerologyProfile",
        },
        modelo: {
            type: String,
            trim: true,
        },
        tokens_usados: {
            type: Number,
            min: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Reading", readingSchema);