import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        nombre_completo: {
            type: String,
            required: [true, "El nombre completo es obligatorio"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "El email es obligatorio"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password_hash: {
            type: String,
            required: [true, "La contraseña es obligatoria"],
        },
        fecha_nacimiento: {
            type: Date,
            required: [true, "La fecha de nacimiento es obligatoria"],
        },
        fecha_registro: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
