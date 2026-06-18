import { getAuth } from "firebase/auth";

const API = (import.meta.env.VITE_API_URL as string) || "";

async function getIdToken(): Promise<string> {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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

export interface TutorChatResponse {
  session_id: string;
  reply: string;
  mode: "focused" | "extended";
  language_code: string;
  persona: string;
  history: { role: "user" | "assistant"; content: string }[];
}

export interface TutorSession {
  session_id: string;
  title: string;
  subject: string;
  message_count: number;
  created_at: string;
  last_updated: string | null;
}

export interface OralExamStartResponse {
  exam_id: string;
  title: string;
  language_code: string;
  persona: string;
  total_questions: number;
  first_question: OralQuestion;
}

export interface OralQuestion {
  id: string;
  question: string;
  key_points: string[];
}

export interface OralAnswerResponse {
  transcription: string;
  evaluation: {
    score: number;
    understanding: string;
    feedback: string;
    covered: string[];
    missed: string[];
  };
  is_complete: boolean;
  next_question?: OralQuestion;
  overall_score?: number;
  overall_feedback?: string;
}

export interface OralExamResults {
  exam_id: string;
  title: string;
  subject: string;
  language_code: string;
  persona: string;
  total_questions: number;
  average_score: number;
  answers: {
    question_id: string;
    question: string;
    transcription: string;
    evaluation: {
      score: number;
      understanding: string;
      feedback: string;
      covered: string[];
      missed: string[];
    };
  }[];
  completed_at: string;
}

export interface ConceptSearchResult {
  concept: string;
  explanation: string;
  complexity: string;
  why_it_matters: string;
  relevance_score: number;
  [key: string]: unknown;
}

export interface DocumentSearchResult {
  document_id: string;
  document_title: string;
  subject: string;
  top_match: ConceptSearchResult;
  other_matches: ConceptSearchResult[];
}

export interface Scene {
  id: number;
  type: "concept_intro" | "bullet_reveal" | "definition" | "flow_diagram" | "comparison" | "equation" | "timeline" | "summary";
  heading?: string;
  subheading?: string;
  points?: string[];
  term?: string;
  meaning?: string;
  steps?: string[];
  left?: { label: string; points: string[] };
  right?: { label: string; points: string[] };
  elements?: string[];
  events?: { label: string; description: string }[];
}

export interface SceneScript {
  type: string;
  title?: string;
  concept?: string;
  complexity?: string;
  attempt?: number;
  total_scenes: number;
  scenes: Scene[];
}

export interface AnimationResponse {
  animation_id: string;
  type: string;
  concept?: string;
  complexity?: string;
  language_code: string;
  persona: string;
  scene_script: SceneScript;
}

export interface EvaluationResponse {
  understood: boolean;
  action?: "regenerate" | "tutor";
  concept: string;
  message: string;
  attempts_remaining?: number;
  next_actions?: { action: string; label: string }[];
}

export interface ConceptListResponse {
  document_id: string;
  title: string;
  subject: string;
  total_concepts: number;
  concepts: {
    concept: string;
    explanation: string;
    complexity: string;
    why_it_matters: string;
  }[];
}

export const aiService = {

  // --- TUTOR CHAT ---
  // The tutor is a floating chat accessible from anywhere in the app.
  // Pass the current document_id so the tutor knows what the student is studying.
  async tutorChat(
    documentId: string,
    message: string,
    options: {
      sessionId?: string;
      searchWeb?: boolean;
      languageCode?: string;
      persona?: string;
    } = {}
  ): Promise<TutorChatResponse> {
    return apiFetch<TutorChatResponse>("/api/tutor/chat", {
      method: "POST",
      body: JSON.stringify({
        document_id: documentId,
        message,
        session_id: options.sessionId ?? null,
        search_web: options.searchWeb ?? false,
        language_code: options.languageCode ?? "en",
        persona: options.persona ?? "university",
      }),
    });
  },

  async *streamResponse(
    documentId: string,
    message: string,
    options: {
      sessionId?: string;
      searchWeb?: boolean;
      languageCode?: string;
      persona?: string;
    } = {}
  ): AsyncGenerator<string, { session_id: string; history: TutorChatResponse["history"] }, unknown> {
    const data = await apiFetch<TutorChatResponse>("/api/tutor/chat", {
      method: "POST",
      body: JSON.stringify({
        document_id: documentId,
        message,
        session_id: options.sessionId ?? null,
        search_web: options.searchWeb ?? false,
        language_code: options.languageCode ?? "en",
        persona: options.persona ?? "university",
      }),
    });

    const tokens = data.reply.split(/(\s+)/);
    for (const token of tokens) {
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 30));
      yield token;
    }

    return { session_id: data.session_id, history: data.history };
  },

  async getTutorSessions(documentId: string): Promise<TutorSession[]> {
    const data = await apiFetch<{ sessions: TutorSession[] }>(
      `/api/tutor/sessions/${documentId}`
    );
    return data.sessions;
  },

  async deleteTutorSession(sessionId: string): Promise<void> {
    await apiFetch(`/api/tutor/session/${sessionId}`, { method: "DELETE" });
  },

  // --- ORAL EXAM ---
  async startOralExam(
    documentId: string,
    options: { count?: number; languageCode?: string; persona?: string } = {}
  ): Promise<OralExamStartResponse> {
    const params = new URLSearchParams({
      count: String(options.count ?? 5),
      language_code: options.languageCode ?? "en",
      persona: options.persona ?? "university",
    });
    return apiFetch<OralExamStartResponse>(
      `/api/oral-exam/start/${documentId}?${params}`
    );
  },

  async submitOralAnswer(
    examId: string,
    audioBlob: Blob,
    filename = "answer.webm"
  ): Promise<OralAnswerResponse> {
    const token = await getIdToken();
    const form = new FormData();
    form.append("audio", audioBlob, filename);
    const res = await fetch(`${API}/api/oral-exam/answer/${examId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Failed to submit answer");
    }
    return res.json() as Promise<OralAnswerResponse>;
  },

  async getOralExamResults(examId: string): Promise<OralExamResults> {
    return apiFetch<OralExamResults>(`/api/oral-exam/results/${examId}`);
  },

  // --- SEARCH ---
  async searchConcepts(
    documentId: string,
    query: string,
    topK = 5
  ): Promise<ConceptSearchResult[]> {
    const params = new URLSearchParams({ q: query, top_k: String(topK) });
    const data = await apiFetch<{ results: ConceptSearchResult[] }>(
      `/api/search/concepts/${documentId}?${params}`
    );
    return data.results;
  },

  async searchAllDocuments(
    query: string,
    topK = 5
  ): Promise<DocumentSearchResult[]> {
    const params = new URLSearchParams({ q: query, top_k: String(topK) });
    const data = await apiFetch<{ results: DocumentSearchResult[] }>(
      `/api/search/documents?${params}`
    );
    return data.results;
  },

  // --- ANIMATION ---
  async getConcepts(documentId: string): Promise<ConceptListResponse> {
    return apiFetch<ConceptListResponse>(
      `/api/animation/concepts/${documentId}`
    );
  },

  async generateIntroAnimation(
    documentId: string,
    options: { languageCode?: string; persona?: string } = {}
  ): Promise<AnimationResponse> {
    const params = new URLSearchParams({
      language_code: options.languageCode ?? "en",
      persona: options.persona ?? "university",
    });
    return apiFetch<AnimationResponse>(
      `/api/animation/intro/${documentId}?${params}`,
      { method: "POST" }
    );
  },

  async generateConceptAnimation(
    documentId: string,
    conceptName: string,
    options: { languageCode?: string; persona?: string } = {}
  ): Promise<AnimationResponse> {
    const params = new URLSearchParams({
      concept_name: conceptName,
      language_code: options.languageCode ?? "en",
      persona: options.persona ?? "university",
    });
    return apiFetch<AnimationResponse>(
      `/api/animation/concept/${documentId}?${params}`,
      { method: "POST" }
    );
  },

  async getSavedAnimations(documentId: string): Promise<AnimationResponse[]> {
    const data = await apiFetch<{ animations: AnimationResponse[] }>(
      `/api/animation/get/${documentId}`
    );
    return data.animations;
  },

  async evaluateAnimation(
    animationId: string,
    satisfied: boolean,
    feedback?: string
  ): Promise<EvaluationResponse> {
    return apiFetch<EvaluationResponse>(
      `/api/animation/evaluate/${animationId}`,
      {
        method: "POST",
        body: JSON.stringify({ satisfied, feedback: feedback ?? null }),
      }
    );
  },

  async regenerateAnimation(animationId: string): Promise<AnimationResponse> {
    return apiFetch<AnimationResponse>(
      `/api/animation/regenerate/${animationId}`,
      { method: "POST" }
    );
  },
};