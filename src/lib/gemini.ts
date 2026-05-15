import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getModel = (modelName: string = "gemini-3-flash-preview") => {
  if (!genAI) return null;
  // According to the skill, we should use ai.models.generateContent
  // but we can wrap it or just export the instance.
  // The skill says: "When using generate content for text answers, do not define the model first and call generate content later. You must use ai.models.generateContent to query GenAI with both the model name and prompt."
  return genAI.models;
};

export async function askGemini(prompt: string, systemInstruction?: string) {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Please add it in the Secrets panel.");
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
