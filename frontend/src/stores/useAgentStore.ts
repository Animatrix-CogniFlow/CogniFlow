import { create } from "zustand";
import type { Agent, AgentId } from "../lib/types";
import { sleep } from "../lib/utils";

// The agents page now shows the real CogniFlow agents — not fake data from contentService.
// These are the actual backend agents that power the product.
const REAL_AGENTS: Agent[] = [
  { id: "story",    name: "Ingestion Agent",   role: "PDF extraction & concept mapping",  status: "idle" },
  { id: "visual",   name: "Animation Agent",   role: "Scene script generation",           status: "idle" },
  { id: "tutor",    name: "Tutor Agent",       role: "Conversational AI teaching",        status: "idle" },
  { id: "motion",   name: "Flashcard Agent",   role: "Study card generation",             status: "idle" },
  { id: "examiner", name: "Quiz Agent",        role: "Multiple choice assessment",        status: "idle" },
  { id: "editor",   name: "Oral Exam Agent",   role: "Speech-based assessment",           status: "idle" },
  { id: "feedback", name: "Search Agent",      role: "Semantic concept search",           status: "idle" },
];

const ORDER: AgentId[] = ["story", "visual", "tutor", "motion", "examiner", "editor", "feedback"];

interface AgentState {
  agents: Agent[];
  orchestrating: boolean;
  load: () => void;
  runOrchestration: () => Promise<void>;
  setStatus: (id: AgentId, status: Agent["status"]) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: REAL_AGENTS,
  orchestrating: false,

  load() {
    // Agents are now hardcoded to real backend agents — no API call needed
    if (!get().agents.length) {
      set({ agents: REAL_AGENTS });
    }
  },

  setStatus: (id, status) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  async runOrchestration() {
    if (get().orchestrating) return;
    set({
      orchestrating: true,
      agents: get().agents.map((a) => ({ ...a, status: "idle" })),
    });

    for (const id of ORDER) {
      get().setStatus(id, "active");
      await sleep(700);
      get().setStatus(id, "complete");
    }

    await sleep(900);
    set({
      orchestrating: false,
      agents: get().agents.map((a) => ({ ...a, status: "idle" })),
    });
  },
}));