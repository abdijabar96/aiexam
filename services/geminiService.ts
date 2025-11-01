import { Subject } from '../types';

export const getAIAnswer = async (subject: Subject, question: string, notes?: string, imageBase64?: string | null, book?: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, question, notes, imageBase64, book }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Use the error message from the backend, or provide a default
      throw new Error(data.error || `Server responded with status: ${response.status}`);
    }

    return data.answer;
  } catch (error) {
    console.error("Error fetching AI answer from backend:", error);
    if (error instanceof Error) {
        return `An error occurred while communicating with the server: ${error.message}. Please try again later.`;
    }
    return "An unknown error occurred while communicating with the server."
  }
};
