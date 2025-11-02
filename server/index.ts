import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Subject } from '../types.js';
import { 
  verifyAccessCode, 
  createAccessCode, 
  getAllCodes, 
  deleteAccessCode,
  verifyAdminPassword,
  createAdminSession,
  verifyAdminToken
} from './auth.js';

dotenv.config();

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY environment variable not set on the server.' 
      });
    }

    const { subject, question, notes, imageBase64, book } = req.body as {
      subject: Subject;
      question: string;
      notes?: string;
      imageBase64?: string | null;
      book?: string;
    };

    if (!subject || (!question && !imageBase64)) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let systemInstruction = `You are an expert AI tutor specializing exclusively in the Kenyan secondary school syllabus for Forms 1-4. 

Subject: ${subject}

IMPORTANT: Provide SHORT, CONCISE answers (2-4 sentences maximum). Be direct and to the point. Only include essential information from the Kenyan syllabus.`;

    if (subject === Subject.Math) {
      systemInstruction = `You are an expert AI tutor specializing in the Kenyan secondary school mathematics syllabus for Forms 1-4. Solve the problem with clear, BRIEF steps. Keep explanations SHORT and focused on the Kenyan syllabus methods.`;
    } else if ((subject === Subject.English || subject === Subject.Kiswahili) && book) {
      systemInstruction = `You are an expert AI tutor specializing in Kenyan secondary school literature for ${subject}. Provide a BRIEF, focused answer about the set book. Keep responses SHORT (3-5 sentences) unless more detail is specifically requested.

Set Book: ${book}
Subject: ${subject}`;
    }

    if (notes && notes.trim()) {
      systemInstruction = `You are an AI tutor for the Kenyan secondary school syllabus. Answer the question based *exclusively* on the provided syllabus notes below. Provide a DETAILED, comprehensive answer since the student has uploaded their study materials.

Subject: ${subject}

--- SYLLABUS NOTES ---
${notes}
--- END OF NOTES ---

Provide a thorough, well-explained answer based on the notes above.`;
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

    const model = (subject === Subject.History || subject === Subject.English || subject === Subject.Kiswahili) 
      ? 'gemini-2.5-pro' 
      : 'gemini-2.5-flash';

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
    
    return res.json({ answer });

  } catch (error) {
    console.error('Error in /api/generate:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/verify-code', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Access code is required' });
    }
    
    const isValid = await verifyAccessCode(code);
    
    if (isValid) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ error: 'Invalid or already used access code' });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    if (verifyAdminPassword(password)) {
      const token = createAdminSession();
      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ error: 'Invalid admin password' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/admin/codes', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const codes = await getAllCodes();
    return res.json(codes);
  } catch (error) {
    console.error('Error fetching codes:', error);
    return res.status(500).json({ error: 'Failed to fetch codes' });
  }
});

app.post('/api/admin/generate-code', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const code = await createAccessCode();
    return res.json({ code });
  } catch (error) {
    console.error('Error generating code:', error);
    return res.status(500).json({ error: 'Failed to generate code' });
  }
});

app.post('/api/admin/delete-code', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { code } = req.body;
    const deleted = await deleteAccessCode(code);
    
    if (deleted) {
      return res.json({ success: true });
    } else {
      return res.status(404).json({ error: 'Code not found' });
    }
  } catch (error) {
    console.error('Error deleting code:', error);
    return res.status(500).json({ error: 'Failed to delete code' });
  }
});

app.listen(PORT, 'localhost', () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});
