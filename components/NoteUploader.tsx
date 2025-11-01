import React, { useState } from 'react';
import { Subject, SyllabusNotes } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';

// Configure the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

interface NoteUploaderProps {
  selectedSubject: Subject;
  onNoteUpload: (subject: Subject, content: string) => void;
  syllabusNotes: SyllabusNotes;
}

export const NoteUploader: React.FC<NoteUploaderProps> = ({ selectedSubject, onNoteUpload, syllabusNotes }) => {
  const [feedback, setFeedback] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback(`Processing ${file.name}...`);
    // Clear previous notes for the subject while processing the new file
    onNoteUpload(selectedSubject, '');

    try {
      let content = '';
      // Handle Plain Text and Markdown
      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        content = await file.text();
      }
      // Handle PDF
      else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
          fullText += pageText + '\n\n';
        }
        content = fullText;
      }
      // Handle .docx
      else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = (window as any).mammoth;
        if (!mammoth || typeof mammoth.extractRawText !== 'function') {
            throw new Error('Mammoth.js library is not loaded correctly. Could not find extractRawText function.');
        }
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      }
      // Handle Invalid File Type
      else {
        setFeedback('Invalid file type. Please upload a .txt, .md, .pdf, or .docx file.');
        return;
      }

      onNoteUpload(selectedSubject, content);
      setFeedback(`${file.name} uploaded successfully.`);

    } catch (error) {
      console.error("Error processing file:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setFeedback(`Error processing file: ${errorMessage}`);
    }
  };

  const hasNotes = !!syllabusNotes[selectedSubject];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-4 text-center flex items-center justify-center gap-2">
        <UploadIcon className="w-6 h-6" />
        Upload {selectedSubject} Syllabus Booklet
      </h2>
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-400 mb-1">
          Booklet (Form 1 - 4)
        </label>
        <div className="flex items-center gap-3">
          <input
            id="file-upload"
            type="file"
            accept=".txt,.md,text/plain,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-green file:text-white hover:file:bg-green-700 cursor-pointer"
            aria-describedby="file-feedback"
          />
        </div>
        <div id="file-feedback" className="text-xs mt-1 h-4">
          {hasNotes && <p className="text-green-400">Booklet for {selectedSubject} is loaded.</p>}
          {feedback && !hasNotes && <p className="text-yellow-400">{feedback}</p>}
        </div>
      </div>
       <p className="text-xs text-gray-500 mt-4 text-center">Upload a single booklet (.txt, .md, .pdf, .docx). The AI will use this as its sole source of knowledge for {selectedSubject}.</p>
    </div>
  );
};