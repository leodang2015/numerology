import { GoogleGenAI, Type } from "@google/genai";

const MODELO_GEMINI = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const apiKey = process.env.GEMINI_API_KEY
    || process.env.Default_Gemini_API_Key
    || process.env["Gemini API Key"];

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const esquemaCompatibilidad = {
    type: Type.OBJECT,
    properties: {
        puntaje_calculado: {
            type: Type.INTEGER,
            description: "Puntaje orientativo de compatibilidad entre 0 y 100."
        },
        interpretacion_ia: {
            type: Type.STRING,
            description: "Interpretación breve en español, de máximo dos frases y 40 palabras."
        }
    },
    required: ["puntaje_calculado", "interpretacion_ia"]
};

export const generarCompatibilidadNumerologica = async (perfil1, perfil2) => {
    if (!ai) {
        throw new Error("Falta configurar GEMINI_API_KEY en el entorno del servidor");
    }

    const prompt = "Evalúa de forma orientativa la compatibilidad numerológica de estos dos perfiles. " +
        "Usa los tres números de cada perfil y asigna un puntaje entero entre 0 y 100. " +
        "Explica en español posibles fortalezas y diferencias en un máximo de dos frases y 40 palabras. " +
        "Sé directo y evita introducciones. No presentes la numerología como ciencia ni hagas predicciones " +
        "deterministas. Devuelve únicamente los campos definidos en el esquema.\n\n" +
        `Perfil 1: número de vida ${perfil1.numero_vida}, número de expresión ${perfil1.numero_expresion}, ` +
        `número de alma ${perfil1.numero_alma}.\n` +
        `Perfil 2: número de vida ${perfil2.numero_vida}, número de expresión ${perfil2.numero_expresion}, ` +
        `número de alma ${perfil2.numero_alma}.`;

    const response = await ai.models.generateContent({
        model: MODELO_GEMINI,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: esquemaCompatibilidad
        }
    });

    let datos;
    try {
        datos = JSON.parse(response.text);
    } catch {
        throw new Error("Gemini devolvió una respuesta que no es JSON válido");
    }

    if (!Number.isInteger(datos.puntaje_calculado)
        || datos.puntaje_calculado < 0
        || datos.puntaje_calculado > 100
        || typeof datos.interpretacion_ia !== "string"
        || !datos.interpretacion_ia.trim()) {
        throw new Error("Gemini devolvió datos de compatibilidad inválidos");
    }

    return datos;
};
