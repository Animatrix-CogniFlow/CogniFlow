import { create } from "zustand";
import type { ChatMessage, Conversation } from "../lib/types";
import { aiService } from "../services/aiService";
import { contentService } from "../services/contentService";
import { uid } from "../lib/utils";

export interface DocumentOption {
  id: string;
  title: string;
  subject: string;
}

interface ChatState {
  documents: DocumentOption[];
  selectedDocumentId: string | null;
  documentsLoading: boolean;
  documentsError: string | null;
  conversations: Conversation[];
  activeId: string;
  isStreaming: boolean;
  persona: string;
  languageCode: string;

  loadDocuments: () => Promise<void>;
  selectDocument: (id: string) => void;
  newConversation: () => void;
  selectConversation: (id: string) => void;
  setPersona: (persona: string) => void;
  setLanguageCode: (code: string) => void;
  sendMessage: (text: string) => Promise<void>;
}

interface ExtendedConversation extends Conversation {
  backendSessionId?: string;
}

function seed(): ExtendedConversation {
  return {
    id: uid("conv"),
    title: "New conversation",
    updatedAt: Date.now(),
    messages: [
      {
        id: uid("msg"),
        role: "assistant",
        content: "Hi — I am your CogniFlow tutor. Select a document above, then ask me anything about it.",
        createdAt: Date.now(),
      },
    ],
  };
}

const initial = seed();

export const useChatStore = create<ChatState>((set, get) => ({
  documents: [],
  selectedDocumentId: null,
  documentsLoading: false,
  documentsError: null,
  conversations: [initial] as ExtendedConversation[],
  activeId: initial.id,
  isStreaming: false,
  persona: "university",
  languageCode: "en",

  setPersona: (persona) => set({ persona }),
  setLanguageCode: (languageCode) => set({ languageCode }),

  async loadDocuments() {
    set({ documentsLoading: true, documentsError: null });
    try {
      const docs = await contentService.fetchDocuments();
      set({ documents: docs, documentsLoading: false });
      if (!get().selectedDocumentId && docs.length > 0) {
        set({ selectedDocumentId: docs[0].id });
      }
    } catch {
      set({
        documentsError: "Could not load your documents. Please try again.",
        documentsLoading: false,
      });
    }
  },

  selectDocument(id) {
    set({ selectedDocumentId: id });
    const c = seed();
    set((s) => ({
      conversations: [c, ...(s.conversations as ExtendedConversation[])],
      activeId: c.id,
    }));
  },

  newConversation() {
    const c = seed();
    set((s) => ({
      conversations: [c, ...(s.conversations as ExtendedConversation[])],
      activeId: c.id,
    }));
  },

  selectConversation(id) {
    set({ activeId: id });
  },

  async sendMessage(text) {
    const { activeId, selectedDocumentId, persona, languageCode } = get();

    if (!selectedDocumentId) {
      const errMsg: ChatMessage = {
        id: uid("msg"),
        role: "assistant",
        content: "Please select a document first — I need something to tutor you on!",
        createdAt: Date.now(),
      };
      set((s) => ({
        conversations: (s.conversations as ExtendedConversation[]).map((c) =>
          c.id === activeId ? { ...c, messages: [...c.messages, errMsg] } : c
        ),
      }));
      return;
    }

    const conversations = get().conversations as ExtendedConversation[];
    const activeConv = conversations.find((c) => c.id === activeId);
    const existingSessionId = activeConv?.backendSessionId;

    const userMsg: ChatMessage = {
      id: uid("msg"),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    const aiMsg: ChatMessage = {
      id: uid("msg"),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      streaming: true,
    };

    set((s) => ({
      isStreaming: true,
      conversations: (s.conversations as ExtendedConversation[]).map((c) =>
        c.id === activeId
          ? {
              ...c,
              title: c.messages.length <= 1 ? text.slice(0, 40) : c.title,
              updatedAt: Date.now(),
              messages: [...c.messages, userMsg, aiMsg],
            }
          : c
      ),
    }));

    try {
      const generator = aiService.streamResponse(selectedDocumentId, text, {
        sessionId: existingSessionId,
        persona,
        languageCode,
      });

      let result: IteratorResult<string, { session_id: string; history: unknown[] }>;
      while (!(result = await generator.next()).done) {
        const token = result.value as string;
        set((s) => ({
          conversations: (s.conversations as ExtendedConversation[]).map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === aiMsg.id ? { ...m, content: m.content + token } : m
                  ),
                }
              : c
          ),
        }));
      }

      const { session_id } = result.value;
      set((s) => ({
        isStreaming: false,
        conversations: (s.conversations as ExtendedConversation[]).map((c) =>
          c.id === activeId
            ? {
                ...c,
                backendSessionId: session_id,
                messages: c.messages.map((m) =>
                  m.id === aiMsg.id ? { ...m, streaming: false } : m
                ),
              }
            : c
        ),
      }));
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      set((s) => ({
        isStreaming: false,
        conversations: (s.conversations as ExtendedConversation[]).map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiMsg.id
                    ? { ...m, content: `⚠️ ${errorText}`, streaming: false }
                    : m
                ),
              }
            : c
        ),
      }));
    }
  },
}));