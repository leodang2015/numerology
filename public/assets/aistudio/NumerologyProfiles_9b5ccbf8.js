import mongoose from "mongoose";

const numerologyProfileSchema = new mongoose.Schema(
    {
        usuario_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "El usuario_id es obligatorio"],
        },
        numero_vida: {
            type: Number,
            required: [true, "El número de vida es obligatorio"],
            min: [1, "El número debe ser al menos 1"],
        },
        numero_expresion: {
            type: Number,
            required: [true, "El número de expresión es obligatorio"],
            min: [1, "El número debe ser al menos 1"],
        },
        numero_alma: {
            type: Number,
            required: [true, "El número de alma es obligatorio"],
            min: [1, "El número debe ser al menos 1"],
        },
    },
    { timestamps: true }
);

export default mongoose.model("NumerologyProfile", numerologyProfileSchema);