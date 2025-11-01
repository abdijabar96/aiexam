export enum Subject {
  History = "History",
  Business = "Business Studies",
  Biology = "Biology",
  Chemistry = "Chemistry",
  Math = "Mathematics",
  English = "English",
  Kiswahili = "Kiswahili",
}

export type Form = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';

export type SyllabusNotes = {
  [key in Subject]?: string;
};