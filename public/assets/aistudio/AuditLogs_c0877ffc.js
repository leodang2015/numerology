import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        endpoint: {
            type: String,
            required: [true, "El endpoint es obligatorio"],
            trim: true,
        },
        metodo: {
            type: String,
            required: [true, "El método HTTP es obligatorio"],
            uppercase: true,
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        },
        status_code: {
            type: Number,
            required: [true, "El status code es obligatorio"],
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);