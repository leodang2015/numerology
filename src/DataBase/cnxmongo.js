import mongoose from "mongoose";

let cachedConnection = null;

export const x = async () => {
    // Si ya hay una conexión activa o conectando en entorno serverless (Vercel)
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (cachedConnection) {
        return cachedConnection;
    }

    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trabajodenumologia";
    
    cachedConnection = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
    });
    
    console.log("Conexión exitosa a MongoDB");
    return cachedConnection;
};
