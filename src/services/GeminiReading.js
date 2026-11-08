import { GoogleGenAI, Type } from "@google/genai";

export const MODELO_GEMINI = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const apiKey = process.env.GEMINI_API_KEY
    || process.env.Default_Gemini_API_Key
    || process.env["Gemini API Key"];

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const esquemaLectura = {
    type: Type.OBJECT,
    properties: {
        resumen: {
            type: Type.STRING,
            description: "Resumen general en un máximo de dos frases y 30 palabras."
        },
        interpretacion_numero_vida: {
            type: Type.STRING,
            description: "Interpretación breve del número de vida, máximo 25 palabras."
        },
        interpretacion_numero_expresion: {
            type: Type.STRING,
            description: "Interpretación breve del número de expresión, máximo 25 palabras."
        },
        interpretacion_numero_alma: {
            type: Type.STRING,
            description: "Interpretación breve del número de alma, máximo 25 palabras."
        },
        fortalezas: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "Fortaleza concisa, máximo ocho palabras."
            },
            description: "Entre tres y cinco fortalezas concisas relacionadas con los números."
        },
        areas_de_trabajo: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "Área de desarrollo concisa, máximo ocho palabras."
            },
            description: "Entre dos y cuatro aspectos concisos que la persona puede desarrollar."
        },
        numero_destacado: {
            type: Type.INTEGER,
            description: "El número del perfil que más destaca en esta lectura."
        }
    },
    required: [
        "resumen",
        "interpretacion_numero_vida",
        "interpretacion_numero_expresion",
        "interpretacion_numero_alma",
        "fortalezas",
        "areas_de_trabajo",
        "numero_destacado"
    ]
};

export const generarLecturaNumerologica = async (perfil, tipoLectura) => {
    if (!ai) {
        throw new Error("Falta configurar GEMINI_API_KEY en el entorno del servidor");
    }

    const prompt = `Genera una lectura numerológica de tipo ${tipoLectura} en español, clara y respetuosa.\n\n` +
        "Interpreta únicamente estos datos; no inventes información personal ni afirmes que la numerología es una ciencia. " +
        "Mantén toda la respuesta breve: resumen de máximo dos frases y 30 palabras; cada interpretación, " +
        "máximo 25 palabras; fortalezas y áreas de trabajo, máximo ocho palabras cada una. " +
        "Evita introducciones y repeticiones. Responde solo con los campos definidos en el esquema.\n" +
        `Número de vida: ${perfil.numero_vida}\n` +
        `Número de expresión: ${perfil.numero_expresion}\n` +
        `Número de alma: ${perfil.numero_alma}`;

    const response = await ai.models.generateContent({
        model: MODELO_GEMINI,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: esquemaLectura
        }
    });

    let datos;
    try {
        datos = JSON.parse(response.text);
    } catch {
        throw new Error("Gemini devolvió una respuesta que no es JSON válido");
    }

    return {
        datos,
        modelo: MODELO_GEMINI,
        tokens_usados: response.usageMetadata?.totalTokenCount ?? null
    };
};
