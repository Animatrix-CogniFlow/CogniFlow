// ============================================================
// CogniFlow — shared domain types
// ============================================================

export type ThemeMode   = "light" | "dark";
export type MotionLevel = "full" | "reduced" | "off";

/**
 * Visual quality tier. "auto" detects device capability and resolves
 * to one of the concrete tiers below.
 */
export type QualityTier   = "auto" | "cinematic" | "balanced" | "performance";
export type ResolvedTier  = "cinematic" | "balanced" | "performance";

/** Concrete render budget derived from the resolved tier. */
export interface QualityProfile {
  tier: ResolvedTier;
  particles:     boolean;
  particleCount: number;
  fps:           number;
  connections:   boolean;
  blobs:         number;
  blur:          string;
  spotlight:     boolean;
  ambientLoops:  boolean;
}

// ── Education levels ────────────────────────────────────────
export type EducationLevel =
  | "high_school"
  | "undergraduate"
  | "postgraduate"
  | "other";

// ── Study goals ─────────────────────────────────────────────
export type StudyGoal =
  | "pass_exams"
  | "learn_skills"
  | "research"
  | "personal_interest";

// ── Preferred study time ─────────────────────────────────────
export type StudyTime = "morning" | "afternoon" | "evening" | "night";

// ── User profile ─────────────────────────────────────────────
export interface User {
  id:          string;
  name:        string;
  email:       string;
  avatarColor: string;
  plan:        "free" | "pro" | "team";

  // Extended profile fields (all optional — filled in Settings)
  country?:          string;
  gender?:           "male" | "female" | "non_binary" | "prefer_not_to_say";
  educationLevel?:   EducationLevel;
  institution?:      string;
  fieldOfStudy?:     string;
  primaryLanguage?:  string;
  studyGoal?:        StudyGoal;
  weeklyStudyHours?: number;
  preferredTime?:    StudyTime;
}

export interface ChatMessage {
  id:         string;
  role:       "user" | "assistant";
  content:    string;
  createdAt:  number;
  streaming?: boolean;
}

export interface Conversation {
  id:        string;
  title:     string;
  updatedAt: number;
  messages:  ChatMessage[];
}

export type AgentId =
  | "story" | "tutor" | "visual"
  | "motion" | "examiner" | "editor" | "feedback";

export type AgentStatus = "idle" | "active" | "complete";

export interface Agent {
  id:     AgentId;
  name:   string;
  role:   string;
  status: AgentStatus;
}

export interface UploadItem {
  id:       string;
  name:     string;
  size:     number;
  progress: number;
  status:   "queued" | "uploading" | "parsing" | "processing" | "done" | "error";
}

export interface LearningSession {
  id:        string;
  title:     string;
  subject:   string;
  progress:  number;
  kind:      "tutor" | "visual" | "oral" | "notes";
  updatedAt: number;
}

export interface TranscriptEntry {
  id:      string;
  speaker: "examiner" | "student";
  text:    string;
}

// ── Spaced repetition (SM-2 algorithm) ──────────────────────

export interface Flashcard {
  id:          string;
  front:       string;
  back:        string;
  ease:        number;   // SM-2 ease factor (>= 1.3)
  interval:    number;   // Days until next review
  repetitions: number;   // Consecutive correct recalls
  dueAt:       number;   // Epoch ms of next due review
  reviews:     number;   // Total reviews
  lapses:      number;
}

export interface QuizQuestion {
  id:          string;
  prompt:      string;
  options:     string[];
  answerIndex: number;   // Index of correct option
  explanation: string;
}

export interface QuizAttempt {
  id:       string;
  takenAt:  number;
  score:    number;   // 0–100
  correct:  number;
  total:    number;
}

export type DeckSource = "manual" | "upload" | "generated";

export interface Deck {
  id:        string;
  title:     string;
  subject:   string;
  createdAt: number;
  updatedAt: number;
  source:    DeckSource;
  notes:     string;
  cards:     Flashcard[];
  quiz:      QuizQuestion[];
  attempts:  QuizAttempt[];
}

/** Quality rating a learner gives during review (SM-2 maps 0..5). */
export type ReviewGrade = "again" | "hard" | "good" | "easy";
