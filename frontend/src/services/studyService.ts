import { getAuth } from "firebase/auth";
import type { Deck, Flashcard, QuizQuestion, ReviewGrade } from "../lib/types";

const API = (import.meta.env.VITE_API_URL as string) || "";

async function getIdToken(): Promise<string> {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface FlashcardSet {
  flashcard_set_id: string;
  title: string;
  mode: string;
  language_code: string;
  persona: string;
  total_cards: number;
  flashcards: Flashcard[];
}

export interface QuizSet {
  quiz_id: string;
  title: string;
  difficulty: string;
  language_code: string;
  persona: string;
  timed: boolean;
  time_limit_minutes: number | null;
  expires_at: string | null;
  total_questions: number;
  questions: QuizQuestion[];
}

export interface QuizResult {
  result_id: string;
  score: number;
  total: number;
  percentage: number;
  feedback: string;
  breakdown: {
    question: string;
    your_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
  }[];
}

const DAY = 24 * 60 * 60 * 1000;

export const studyService = {

  // --- FLASHCARDS ---
  // persona adjusts tone and complexity of generated cards
  async generateFlashcards(
    documentId: string,
    options: {
      count?: number;
      mode?: "quick_recall" | "concept_check";
      languageCode?: string;
      persona?: string;
    } = {}
  ): Promise<FlashcardSet> {
    const params = new URLSearchParams({
      count: String(options.count ?? 10),
      mode: options.mode ?? "quick_recall",
      language_code: options.languageCode ?? "en",
      persona: options.persona ?? "university",
    });
    return apiFetch<FlashcardSet>(
      `/api/flashcards/generate/${documentId}?${params}`,
      { method: "POST" }
    );
  },

  async getFlashcards(
    documentId: string,
    mode: "quick_recall" | "concept_check" = "quick_recall"
  ): Promise<FlashcardSet> {
    return apiFetch<FlashcardSet>(
      `/api/flashcards/get/${documentId}?mode=${mode}`
    );
  },

  // --- QUIZ ---
  // persona adjusts question style and vocabulary level
  async generateQuiz(
    documentId: string,
    options: {
      count?: number;
      difficulty?: "easy" | "medium" | "hard";
      languageCode?: string;
      persona?: string;
      timed?: boolean;
      timeLimit?: number;
    } = {}
  ): Promise<QuizSet> {
    const params = new URLSearchParams({
      count: String(options.count ?? 10),
      difficulty: options.difficulty ?? "medium",
      language_code: options.languageCode ?? "en",
      persona: options.persona ?? "university",
      timed: String(options.timed ?? false),
    });
    if (options.timed && options.timeLimit) {
      params.set("time_limit", String(options.timeLimit));
    }
    return apiFetch<QuizSet>(
      `/api/quiz/generate/${documentId}?${params}`,
      { method: "POST" }
    );
  },

  async submitQuiz(
    quizId: string,
    answers: Record<string, string>
  ): Promise<QuizResult> {
    return apiFetch<QuizResult>("/api/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ quiz_id: quizId, answers }),
    });
  },

  async getQuizResults(documentId: string) {
    return apiFetch(`/api/quiz/results/${documentId}`);
  },

  // --- SPACED REPETITION (frontend-only UI feature) ---
  // This runs locally and does not affect what the backend stores.
  // It is kept purely to help the student track which cards to review next.
  scheduleCard(card: Flashcard, grade: ReviewGrade): Flashcard {
    const q = grade === "again" ? 2 : grade === "hard" ? 3 : grade === "good" ? 4 : 5;
    const passed = q >= 3;

    let { ease, interval, repetitions, lapses } = card as any;

    if (!passed) {
      repetitions = 0;
      interval = 0;
      lapses += 1;
    } else {
      repetitions += 1;
      if (repetitions === 1) interval = 1;
      else if (repetitions === 2) interval = 6;
      else interval = Math.round(interval * ease);
      if (grade === "hard") interval = Math.max(1, Math.round(interval * 0.6));
      if (grade === "easy") interval = Math.round(interval * 1.3);
    }

    ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ease < 1.3) ease = 1.3;

    const dueAt =
      Date.now() +
      Math.max(0, interval) * DAY +
      (interval === 0 ? 60 * 1000 : 0);

    return {
      ...card,
      ease: Math.round(ease * 100) / 100,
      interval,
      repetitions,
      lapses,
      dueAt,
      reviews: (card as any).reviews + 1,
    };
  },

  dueCards(cards: Flashcard[]): Flashcard[] {
    const now = Date.now();
    return cards.filter((c: any) => c.dueAt <= now);
  },

  deckMastery(deck: Deck): number {
    if (!deck.cards.length) return 0;
    const mastered = deck.cards.filter(
      (c: any) => c.repetitions >= 2 && c.interval >= 6
    ).length;
    return Math.round((mastered / deck.cards.length) * 100);
  },
};