import mongoose from "mongoose";

export const x = async () => {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trabajodenumologia");
        console.log("Conexión exitosa a MongoDB");

};