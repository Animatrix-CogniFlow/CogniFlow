# CogniFlow

An intelligent, AI-powered edtech platform engineered to eliminate the "illusion of competence" in secondary and tertiary students. By pivoting away from passive reading and video consumption, CogniFlow utilizes an **Agentic Socratic Retrieval-Augmented Generation (RAG)** pipeline to actively cross-examine students, identify conceptual gaps, and guide them toward mastery through conversational active recall.

Developed under the **Animatrix** Organization.

---

## 💻 Core Technology Stack

CogniFlow utilizes a decoupled, high-performance architecture built on lightweight, scalable frameworks:

*   **Frontend Ecosystem:** Built with **Next.js** for server-side rendering and optimized SEO, paired with **Framer Motion** to deliver fluid, micro-interactive UI transitions and programmatic animation states during intensive chat modules.
*   **Backend Engineering:** Powered by **FastAPI** (Python), chosen for its asynchronous execution capabilities, high-speed data validation, and native compatibility with Python-based AI orchestration libraries.
*   **Database & Security Layer:** Managed via **Firebase** (Firebase Authentication for secure user lifecycle management; Firestore/Cloud Storage for managing unstructured user profiles and study document repositories).
*   **AI Engine:** Driven by the **Gemini API**, structured around custom system routing instructions to enforce Socratic methodologies rather than raw text summarization.

---

## 🏗️ System Architecture & Data Flow

Below is the conceptual operational lifecycle of a CogniFlow learning session:

1.  **Ingestion:** The student uploads core learning assets (e.g., a 40-slide lecture on data structures or high school chemistry).
2.  **Context Pinning (RAG):** The FastAPI backend extracts semantic chunks, creating a localized knowledge base that strictly bounds the AI to prevent hallucinations.
3.  **Socratic Drilling:** Instead of summarizing the file, the agent initializes a text-based, active interrogation session. It evaluates responses dynamically and adapts its next query to target perceived comprehension flaws.

---

## 📂 Documentation Directory

To keep the development roadmap clear, the repository core is modularized across the following foundational assets:

*   **[`Who Hurts Most.md`](./Who%20Hurts%20Most.md) (Target Audience Analysis):** A psychological and behavioral deep dive into our core personas—*The Cramming Tertiary Student* and *The Isolated Secondary Student*—mapping out their immediate academic frustrations and how CogniFlow explicitly resolves them.
*   **[`Project scope.md`](./Project%20scope.md) (MVP Definition & Roadmap):** The strict functional boundaries for Phase 1 of development. This matrix explicitly highlights what is built inside the MVP (text-based loops, Firebase auth, RAG ingestion) versus what is structurally deferred to Phase 2 (voice-to-voice testing).

---

## 🚀 Getting Started (Future Iterations)

As development on the sub-modules transitions from architecture design to active deployment, this repository will house the cross-functional orchestration scripts. 

### Prerequisites (For the upcoming dev phase)
- Node.js (v18.x or higher)
- Python (3.10+ or higher)
- Firebase Project Instance Credentials
- Google AI Studio API Key (Gemini)

---

## 📄 License & Contribution
This ecosystem is owned and maintained by the **Animatrix** development team. Contribution workflows, branch naming conventions, and pull request structures will be released alongside the core repository code bases.