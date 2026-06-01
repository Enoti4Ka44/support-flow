import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "hello. tell me priority (low, medium, high) and category (hardware, network, access_rights, other) and ai_response for 'I forgot my password'",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING },
            category: { type: Type.STRING },
            ai_response: { type: Type.STRING }
          },
          required: ["priority", "category", "ai_response"]
        }
      }
    });

    console.log("RESPONSE SUCCESS:", response.text);
  } catch (err) {
    console.error("RESPONSE ERROR:", err instanceof Error ? err.stack : err);
  }
}

test();
