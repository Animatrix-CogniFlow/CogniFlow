import {
  LayoutDashboard,
  MessagesSquare,
  Upload,
  Sparkles,
  Mic,
  Network,
  Settings,
  Layers,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/app", icon: LayoutDashboard, description: "Your intelligent overview" },
  { label: "Study Decks", to: "/app/study", icon: Layers, description: "Flashcards, quizzes & SRS" },
  { label: "Upload", to: "/app/upload", icon: Upload, description: "Notes to animations" },
  { label: "Visual Lab", to: "/app/lab", icon: Sparkles, description: "Cinematic Study Environment" },
  { label: "Oral Exam", to: "/app/oral", icon: Mic, description: "Speak & be assessed" },
  { label: "Orchestration", to: "/app/agents", icon: Network, description: "Multi-agent graph" },
  { label: "Settings", to: "/app/settings", icon: Settings, description: "Preferences" },
  { label: "Profile", to: "/app/profile", icon: UserCircle, description: "Manage your account" },
];
