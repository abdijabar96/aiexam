import { GoogleGenAI } from "@google/genai";
import { Subject } from '../types';

// This will use the API key from the AI Studio environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamAIAnswer = async (
  subject: Subject, 
  question: string, 
  onStream: (chunk: string) => void,
  onError: (error: string) => void,
  notes?: string, 
  imageBase64?: string | null, 
  book?: string
): Promise<void> => {
  try {
    // Construct the system instruction and prompt payload.
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
    
    const parts: any[] = [];
    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/.*?);base64,(.*)$/);
      if (match) {
        const mimeType = match[1];
        const data = match[2];
        parts.push({ inlineData: { mimeType, data } });
      }
    }
    parts.push({ text: `Question: ${question}` });


    const model = (subject === Subject.History || subject === Subject.English || subject === Subject.Kiswahili) ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    // Call the Gemini API's streaming endpoint.
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
      },
    });

    for await (const chunk of responseStream) {
        onStream(chunk.text);
    }
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        onError(`An error occurred while communicating with the AI: ${error.message}. Please try again later.`);
    } else {
        onError("An unknown error occurred while communicating with the AI.");
    }
  }
};