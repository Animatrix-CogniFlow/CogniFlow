import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { LearningSession } from "../../lib/types";
import { SpotlightCard } from "../ui/SpotlightCard";
import { Badge } from "../ui/Badge";
import { timeAgo } from "../../lib/utils";

const KIND_LABEL: Record<LearningSession["kind"], string> = {
  tutor:  "AI Tutor",
  visual: "Visual Lab",
  oral:   "Oral Exam",
  notes:  "Notes",
};

const KIND_ROUTE: Record<LearningSession["kind"], string> = {
  tutor:  "/app/tutor",
  visual: "/app/lab",
  oral:   "/app/oral",
  notes:  "/app/upload",
};

export function SessionCard({ session }: { session: LearningSession }) {
  const navigate = useNavigate();
  return (
    <motion.div whileHover={{ y: -4 }}>
      <SpotlightCard className="overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <Badge tone="gold">{KIND_LABEL[session.kind]}</Badge>
            <span className="text-xs text-silver-500 dark:text-cobalt-400">{timeAgo(session.updatedAt)}</span>
          </div>

          <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-silver-900 dark:text-cobalt-100">
            {session.title}
          </h3>
          <p className="text-sm text-silver-600 dark:text-cobalt-300">{session.subject}</p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-silver-500 dark:text-cobalt-400">Progress</span>
              <span className="font-medium text-silver-800 dark:text-cobalt-200">{session.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-silver-200 dark:bg-abyss-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${session.progress}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 dark:from-cobalt-400 dark:to-cobalt-600"
              />
            </div>
          </div>

          <button
            onClick={() => navigate(KIND_ROUTE[session.kind])}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 transition-all hover:gap-2.5 dark:text-cobalt-400"
          >
            <Play className="h-3.5 w-3.5" /> Continue
          </button>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
