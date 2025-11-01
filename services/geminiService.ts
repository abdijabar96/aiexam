
import { GoogleGenAI } from "@google/genai";
import { Subject } from '../types';

// Lazily initialize the AI instance to avoid a module-level crash if the API key is missing.
// The main App component will handle showing a user-friendly error.
let ai: GoogleGenAI | null = null;
const getAiInstance = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      // This is a fallback and should ideally not be reached if the UI check works correctly.
      throw new Error("VITE_GOOGLE_API_KEY environment variable not set. This should have been caught by the UI.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const getAIAnswer = async (subject: Subject, question: string, notes?: string, imageBase64?: string | null, book?: string): Promise<string> => {
  try {
    const aiInstance = getAiInstance();
    let systemInstruction = `You are an expert AI tutor specializing exclusively in the Kenyan secondary school syllabus. Your knowledge is strictly limited to the content covered in the official curriculum for Forms 1 through 4 in Kenya. Do not provide any information, examples, or context from outside this syllabus, even if it is related or more advanced.

Your task is to answer the following question from the perspective of the Kenyan syllabus for the specified subject.

Subject: ${subject}`;

    if (subject === Subject.Math) {
        systemInstruction = `You are an expert AI tutor specializing in the Kenyan secondary school mathematics syllabus for Forms 1-4. Your task is to solve the mathematical problem presented in the image and/or text. Provide a clear, step-by-step solution that would be easy for a Kenyan secondary school student to understand. Adhere strictly to the methods and curriculum of the Kenyan syllabus.`;
    } else if ((subject === Subject.English || subject === Subject.Kiswahili) && book) {
        systemInstruction = `You are an expert AI tutor specializing in Kenyan secondary school literature for ${subject}. Your task is to answer the user's question about the specified set book. Provide a comprehensive, well-structured response that demonstrates a deep understanding of the book's characters, themes, and plot, adhering to the standards expected in the Kenyan secondary school curriculum (KCSE).

Set Book: ${book}
Subject: ${subject}`;
    }


    if (notes && notes.trim()) {
      systemInstruction = `You are an AI tutor for the Kenyan secondary school syllabus. Your task is to answer the user's question based *exclusively* on the provided syllabus notes below. Do not use any external knowledge or information outside of this text. If the answer cannot be found in the provided notes, state that clearly and mention that the information is not in the provided syllabus material.

Subject: ${subject}

--- SYLLABUS NOTES ---
${notes}
--- END OF NOTES ---

Answer the question based only on the notes provided above.`;
    }
    
    const textPart = { text: `Question: ${question}` };
    const parts: any[] = [textPart];

    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/.*?);base64,(.*)$/);
      if (match) {
        const mimeType = match[1];
        const data = match[2];
        const imagePart = {
          inlineData: {
            mimeType,
            data,
          },
        };
        parts.unshift(imagePart); // Add image as the first part
      } else {
        console.warn("Invalid base64 image format received.");
      }
    }

    const model = (subject === Subject.History || subject === Subject.English || subject === Subject.Kiswahili) ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    const response = await aiInstance.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching AI answer:", error);
    if (error instanceof Error) {
        return `An error occurred while communicating with the AI: ${error.message}. Please check your connection and API key.`;
    }
    return "An unknown error occurred while communicating with the AI."
  }
};
