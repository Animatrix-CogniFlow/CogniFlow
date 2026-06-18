import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Flashcard, ReviewGrade } from "../lib/types";
import { studyService } from "../services/studyService";

// The study store now tracks backend document IDs and their generated content.
// It no longer generates content locally — everything comes from the backend.

interface DocumentStudyData {
  document_id: string;
  title: string;
  subject: string;
  flashcard_set_id?: string;
  quiz_id?: string;
  flashcards?: Flashcard[];
  // Spaced repetition scheduling is kept local — it is a UI concern only
  scheduledCards?: Record<string, Flashcard>;
}

interface StudyState {
  documents: DocumentStudyData[];
  
  // Track a document the student is actively studying
  addDocument: (doc: DocumentStudyData) => void;
  removeDocument: (documentId: string) => void;
  getDocument: (documentId: string) => DocumentStudyData | undefined;
  
  // Save flashcard set returned from backend
  saveFlashcards: (documentId: string, flashcardSetId: string, flashcards: Flashcard[]) => void;
  
  // Save quiz id returned from backend
  saveQuizId: (documentId: string, quizId: string) => void;
  
  // Spaced repetition — runs locally, does not affect backend
  reviewCard: (documentId: string, cardId: string, grade: ReviewGrade) => void;
  dueCards: (documentId: string) => Flashcard[];
  totalDue: () => number;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      documents: [],

      addDocument: (doc) => {
        set((s) => {
          const exists = s.documents.find((d) => d.document_id === doc.document_id);
          if (exists) return s;
          return { documents: [doc, ...s.documents] };
        });
      },

      removeDocument: (documentId) => {
        set((s) => ({
          documents: s.documents.filter((d) => d.document_id !== documentId),
        }));
      },

      getDocument: (documentId) => {
        return get().documents.find((d) => d.document_id === documentId);
      },

      saveFlashcards: (documentId, flashcardSetId, flashcards) => {
        set((s) => ({
          documents: s.documents.map((d) =>
            d.document_id === documentId
              ? { ...d, flashcard_set_id: flashcardSetId, flashcards }
              : d
          ),
        }));
      },

      saveQuizId: (documentId, quizId) => {
        set((s) => ({
          documents: s.documents.map((d) =>
            d.document_id === documentId ? { ...d, quiz_id: quizId } : d
          ),
        }));
      },

      // Spaced repetition runs locally — just updates scheduling metadata
      reviewCard: (documentId, cardId, grade) => {
        set((s) => ({
          documents: s.documents.map((d) => {
            if (d.document_id !== documentId) return d;
            const cards = d.flashcards ?? [];
            const updated = cards.map((c) =>
              c.id === cardId ? studyService.scheduleCard(c, grade) : c
            );
            return { ...d, flashcards: updated };
          }),
        }));
      },

      dueCards: (documentId) => {
        const doc = get().documents.find((d) => d.document_id === documentId);
        if (!doc?.flashcards) return [];
        return studyService.dueCards(doc.flashcards);
      },

      totalDue: () => {
        return get().documents.reduce((sum, d) => {
          if (!d.flashcards) return sum;
          return sum + studyService.dueCards(d.flashcards).length;
        }, 0);
      },
    }),
    { name: "cogniflow-study" }
  )
);