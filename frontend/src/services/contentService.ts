import { getAuth } from "firebase/auth";
import type { DocumentOption } from "../stores/useChatStore";

const API = (import.meta.env.VITE_API_URL as string) || "";

async function getIdToken(): Promise<string> {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken(true);
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

export interface UploadResult {
  document_id: string;
  title: string;
  subject: string;
  summary: string;
  total_concepts: number;
  key_concepts: {
    concept: string;
    explanation: string;
    complexity: string;
    subtopics: string[];
    why_it_matters: string;
  }[];
  language_code: string;
  persona: string;
  file_size_mb: number;
  message: string;
}

export interface UploadProgressEvent {
  stage: string;
  progress: number;
}

export const contentService = {

  // Fetches all documents the student has uploaded from Firestore
  async fetchDocuments(): Promise<DocumentOption[]> {
    const { getAuth } = await import("firebase/auth");
    const { getFirestore, collection, query, where, getDocs, orderBy } =
      await import("firebase/firestore");

    const user = getAuth().currentUser;
    if (!user) throw new Error("Not authenticated");

    const db = getFirestore();
    const q = query(
      collection(db, "documents"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title ?? doc.data().filename,
      subject: doc.data().subject ?? "General",
    }));
  },

  // Uploads a PDF to the backend — Gemini extracts concepts and returns document_id
  // persona is passed so the extraction tone matches the student
  async *uploadDocument(
    file: File,
    languageCode = "en",
    persona = "university"
  ): AsyncGenerator<UploadProgressEvent, UploadResult, unknown> {
    const token = await getIdToken();

    yield { stage: "Uploading", progress: 5 };

    const form = new FormData();
    form.append("file", file);

    const fetchPromise = fetch(
      `${API}/api/ingest/upload?language_code=${languageCode}&persona=${persona}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );

    for (let p = 10; p <= 20; p += 5) {
      await new Promise((r) => setTimeout(r, 300));
      yield { stage: "Uploading", progress: p };
    }

    const res = await fetchPromise;
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Upload failed");
    }

    const stages: { stage: string; from: number; to: number }[] = [
      { stage: "Parsing document",        from: 25, to: 50 },
      { stage: "Extracting concepts",     from: 50, to: 78 },
      { stage: "Generating study material", from: 78, to: 100 },
    ];

    const resultPromise = res.json() as Promise<UploadResult>;

    for (const s of stages) {
      for (let p = s.from; p <= s.to; p += 4) {
        await new Promise((r) => setTimeout(r, 120));
        yield { stage: s.stage, progress: Math.min(p, s.to) };
      }
    }

    return await resultPromise;
  },

  // Fetches recent tutor sessions for dashboard display
  async fetchSessions() {
    const { getAuth } = await import("firebase/auth");
    const { getFirestore, collection, query, where, getDocs, orderBy, limit } =
      await import("firebase/firestore");

    const user = getAuth().currentUser;
    if (!user) return [];

    const db = getFirestore();
    const q = query(
      collection(db, "tutor_sessions"),
      where("user_id", "==", user.uid),
      orderBy("last_updated", "desc"),
      limit(10)
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title ?? "Untitled",
        subject: d.subject ?? "General",
        progress: Math.min(100, (d.history?.length ?? 0) * 10),
        kind: "tutor" as const,
        updatedAt: d.last_updated
          ? new Date(d.last_updated).getTime()
          : Date.now(),
      };
    });
  },

  // Search endpoints
  async searchAllDocuments(query: string, topK: number = 5) {
    const params = new URLSearchParams({ q: query, top_k: String(topK) });
    return apiFetch(`/api/search/documents?${params}`, { method: "GET" });
  },

  async searchDocumentConcepts(documentId: string, query: string, topK: number = 5) {
    const params = new URLSearchParams({ q: query, top_k: String(topK) });
    return apiFetch(`/api/search/concepts/${documentId}?${params}`, { method: "GET" });
  },
};