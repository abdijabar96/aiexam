// IMPORTANT: This file contains the code for your new Supabase Edge Function.
// To deploy:
// 1. Create a new Edge Function named 'generate' in your Supabase project dashboard.
// 2. Paste the entire content of this file into the function's editor.
// 3. Set your GEMINI_API_KEY as a secret in your Supabase project settings.

// Deno uses URL or npm: specifiers for imports.
// @deno-types="npm:@google/genai@^1.27.0"
import { GoogleGenAI } from "npm:@google/genai@^1.27.0";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Fix: Add a type declaration for the 'Deno' global object.
// This is necessary for TypeScript to recognize Deno.env when not in a full Deno environment,
// resolving the "Cannot find name 'Deno'" error. The previous triple-slash directive for Deno types
// was pointing to an invalid URL and has been removed.
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Because this code runs in a separate environment from your frontend,
// you may need to share types. For simplicity, the Subject enum is redefined here.
enum Subject {
  History = "History",
  Business = "Business Studies",
  Biology = "Biology",
  Chemistry = "Chemistry",
  Math = "Mathematics",
  English = "English",
  Kiswahili = "Kiswahili",
}

// CORS headers are required to allow your frontend to call this function.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get Gemini API Key from Supabase environment secrets.
    // Deno.env.get is used in Supabase functions to access secrets.
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable not set in Supabase project.');
    }

    // 2. Parse the request body sent from the frontend.
    const { subject, question, notes, imageBase64, book } = await req.json();

    if (!subject || (!question && !imageBase64)) {
      return new Response(JSON.stringify({ error: 'Missing required parameters.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Initialize the Gemini client with the secure API key.
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // 4. Construct the system instruction and prompt payload.
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
        parts.unshift(imagePart);
      }
    }

    const model = (subject === Subject.History || subject === Subject.English || subject === Subject.Kiswahili) ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    // 5. Call the Gemini API from the secure backend.
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
      },
    });

    const answer = response.text;
    
    // 6. Return the successful response to the frontend.
    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in Supabase function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 7. Start the Deno server to listen for requests.
serve(handler);