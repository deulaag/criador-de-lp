import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, IMAGE_RECREATION_PROMPT } from "../constants";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLandingPage = async (userPrompt: string, imageBase64?: string): Promise<string> => {
  try {
    // Determine which system prompt to use
    const systemInstruction = imageBase64 ? IMAGE_RECREATION_PROMPT : SYSTEM_PROMPT;
    
    // Construct parts array
    const parts: any[] = [{ text: userPrompt }];

    // Add image if present
    if (imageBase64) {
      // Extract the base64 data (remove "data:image/png;base64," prefix if present)
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Generic mimeType, Gemini handles detection well usually, or we could pass it from frontend
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: [
        {
          role: 'user',
          parts: parts
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: imageBase64 ? 0.4 : 0.7, // Lower temperature for replication (precision), higher for creative generation
      }
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("A IA não retornou nenhum conteúdo.");
    }

    return extractCodeBlock(text);
  } catch (error) {
    console.error("Erro ao gerar LP:", error);
    throw error;
  }
};

// Helper to clean up Markdown code blocks
function extractCodeBlock(text: string): string {
  const codeBlockRegex = /```(?:html)?\s*([\s\S]*?)\s*```/;
  const match = text.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return text.trim();
}
