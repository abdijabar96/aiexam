
import { Subject, Form } from './types';

export const SUBJECTS: Subject[] = [
  Subject.History,
  Subject.Business,
  Subject.Biology,
  Subject.Chemistry,
  Subject.Math,
  Subject.English,
  Subject.Kiswahili,
];

export const FORMS: Form[] = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];

export const SET_BOOKS: { [key in Subject]?: string[] } = {
  [Subject.English]: [
    "Fathers of Nations",
    "The Samaritan",
    "An Artist of the Floating World",
    "A Doll's House",
    "Blossoms of the Savannah",
    "The Pearl",
  ],
  [Subject.Kiswahili]: [
    "Chozi la Heri",
    "Kigogo",
    "Tumbo Lisiloshiba na Hadithi Nyingine",
    "Bembea ya Maisha",
    "Mapambazuko ya Machweo",
    "Nguu za Jadi",
  ],
};