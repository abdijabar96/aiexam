import React, { useState, useCallback, useEffect } from 'react';
import { Subject, SyllabusNotes } from './types';
import { getAIAnswer } from './services/geminiService';
import { SubjectSelector } from './components/SubjectSelector';
import { QuestionInput } from './components/QuestionInput';
import { AnswerDisplay } from './components/AnswerDisplay';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { NoteUploader } from './components/NoteUploader';
import { ImageUploader } from './components/ImageUploader';
import { SET_BOOKS } from './constants';
import { EssaySection } from './components/EssaySection';

const App: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [essayQuestion, setEssayQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabusNotes, setSyllabusNotes] = useState<SyllabusNotes>({});
  const [image, setImage] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string>('');

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setQuestion('');
    setEssayQuestion('');
    setAnswer('');
    setError(null);
    setImage(null);
    setSelectedBook('');
  };

  const handleNoteUpload = (subject: Subject, content: string) => {
    setSyllabusNotes(prev => ({
      ...prev,
      [subject]: content,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedSubject) return;

    let currentQuestion = question.trim();
    let currentBook = selectedBook;

    // Determine which question to use
    const isEssay = selectedSubject === Subject.English || selectedSubject === Subject.Kiswahili;
    if (isEssay) {
      currentQuestion = essayQuestion.trim();
      if (!currentBook || !currentQuestion) return;
    } else if (!currentQuestion && !image) {
      return;
    }

    setIsLoading(true);
    setAnswer('');
    setError(null);

    const notes = syllabusNotes[selectedSubject] || '';
    
    // For Math with only image, set a default question
    if (selectedSubject === Subject.Math && image && !currentQuestion) {
      currentQuestion = "Solve the problem in the image.";
    }

    try {
      const result = await getAIAnswer(selectedSubject, currentQuestion, notes, image, isEssay ? currentBook : undefined);
      // The service now handles errors and returns a string, so we can check for error patterns if needed,
      // but for now we'll just display it. A more robust solution might return an object { answer: string } | { error: string }
      if (result.toLowerCase().includes("error occurred")) {
          setError(result);
      } else {
          setAnswer(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, question, essayQuestion, syllabusNotes, image, selectedBook]);

  const showUploader = selectedSubject === Subject.Business || selectedSubject === Subject.Chemistry;
  const showImageUploader = selectedSubject === Subject.Math;
  const showEssaySection = selectedSubject === Subject.English || selectedSubject === Subject.Kiswahili;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-8">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4">
            <BookOpenIcon className="w-10 h-10 text-brand-green" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-100">
                Kenya Syllabus AI Tutor
            </h1>
        </div>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Your AI partner for the Kenyan 8-4-4 secondary school curriculum. Select a subject and ask away!
        </p>
      </header>

      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <SubjectSelector 
            selectedSubject={selectedSubject} 
            onSelectSubject={handleSelectSubject} 
            isLoading={isLoading} 
            />
        </div>
        
        {selectedSubject && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-8">
            {showUploader && <NoteUploader selectedSubject={selectedSubject} onNoteUpload={handleNoteUpload} syllabusNotes={syllabusNotes} />}
            {showImageUploader && <ImageUploader image={image} onImageChange={setImage} isLoading={isLoading} />}
            
            {showEssaySection ? (
              <EssaySection 
                selectedSubject={selectedSubject as Subject.English | Subject.Kiswahili}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                selectedBook={selectedBook}
                setSelectedBook={setSelectedBook}
                essayQuestion={essayQuestion}
                setEssayQuestion={setEssayQuestion}
              />
            ) : (
               <QuestionInput
                  question={question}
                  setQuestion={setQuestion}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  selectedSubject={selectedSubject}
                  hasImage={!!image}
              />
            )}
          </div>
        )}

        {selectedSubject && (
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <AnswerDisplay answer={answer} isLoading={isLoading} error={error} />
            </div>
        )}
      </div>

      <footer className="text-center mt-10 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Kenya Syllabus AI Tutor. For educational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
