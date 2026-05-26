# Project Scope & MVP Definition (Phase 1)

This document outlines the strict technical and functional boundaries for the Minimum Viable Product (MVP) of CogniFlow. The objective of Phase 1 is to deliver a functional, high-impact Socratic learning tool while keeping architecture lean and development fast.

---

## 1. System Architecture Overview

CogniFlow is built using a decoupled architecture to ensure independent scaling of the user interface and AI processing layers:
- **Frontend Layer:** Next.js (React framework) hosted on Vercel, utilizing Framer Motion for highly responsive, micro-interactive UI elements.
- **Backend Service Layer:** FastAPI (Python) optimized for asynchronous handling of AI streaming responses and heavy data processing.
- **Database & Auth Layer:** Firebase (Authentication for user lifecycle management; Firestore/Cloud Storage for user profiles and file hosting).
- **AI Core:** Gemini API orchestrated via an agentic Retrieval-Augmented Generation (RAG) pattern.

---

## 2. In-Scope: The MVP Feature Set

Only features that directly alleviate the "Illusion of Competence" and "Feedback Vacuum" are included in the MVP.

### A. Authentication & Onboarding
- Secure Email/Password registration and login via Firebase Auth.
- Basic onboarding flow capturing user tier: **Secondary** (High School/Syllabus-focused) vs. **Tertiary** (University/Course-focused).

### B. Smart Knowledge Base Ingestion (RAG Pipeline)
- **Document Upload:** Users can upload PDF, PPTX, or TXT study materials (lecture slides, syllabus outlines, textbooks).
- **Text Processing:** FastAPI extracts and chunks the text, generating vector embeddings to pass context to the Gemini model.
- **Context Pinning:** The AI is strictly bounded to the uploaded document to prevent "hallucinations" and ensure it tests only relevant material.

### C. The Core Engine: Text-Based Socratic Drilling
- **Socratic Prompting Loop:** The AI acts as an active inquisitor. Instead of summarizing the file, it asks a challenging conceptual question based on the upload.
- **Interactive Evaluation:** The user types their answer. The AI analyzes the response, validates correct logic, and uses targeted follow-up questions to probe identified weak points.
- **Session End:** A structured wrap-up when a topic is completed, providing a conceptual breakdown of the student's mastery.

### D. Micro-Interactive UI/UX
- Smooth state transitions handled by Framer Motion during the drilling chat interface (e.g., loading states, dynamic conversational bubbles, scoring animations).
- Clean, responsive design optimized for both desktop (laptops used by tertiary students) and mobile screens.

---

## 3. Out-of-Scope: Post-MVP Roadmap (Phase 2+)

To prevent development bottlenecks, the following features are strictly deferred to future iterations and will **not** be built in Phase 1.

| Feature Deferred | Reason for Deferral | Phase 2 Alternative |
| :--- | :--- | :--- |
| **Real-time Voice-to-Voice** | High latency, complex WebRTC setup, increased API costs. | Pure text-based conversational inputs and responses. |
| **Automated Syllabus Scraping** | High maintenance; scraping school portals is highly fragile. | Purely user-driven document upload (PDF/Slides). |
| **Peer Study Groups & Gamification** | High database synchronization overhead and UI complexity. | Individual student-to-AI interaction models. |
| **Offline Processing Capabilities** | Vector searching and Gemini inference require heavy cloud architecture. | Strict requirement for an active internet connection. |

---

## 4. Success Metrics for MVP Delivery
1. **Response Latency:** AI text-streaming initialization under 1.5 seconds.
2. **Context Accuracy:** 0% external hallucinations; AI queries must stay anchored to user-uploaded files.
3. **User Flow Efficiency:** A student must be able to log in, upload a slide deck, and begin a Socratic session in less than 4 steps.