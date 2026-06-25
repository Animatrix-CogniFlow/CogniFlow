import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookText,
  GraduationCap,
  Image as ImageIcon,
  Film,
  ClipboardCheck,
  Scissors,
  MessageSquareHeart,
  Play,
} from "lucide-react";
import type { AgentId } from "../../lib/types";
import { PageContainer } from "../../components/shell/PageContainer";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { AmbientBackground } from "../../components/visuals/AmbientBackground";
import { useAgentStore } from "../../stores/useAgentStore";
import { cn } from "../../lib/utils";

const ICONS: Record<AgentId, typeof BookText> = {
  story: BookText,
  tutor: GraduationCap,
  visual: ImageIcon,
  motion: Film,
  examiner: ClipboardCheck,
  editor: Scissors,
  feedback: MessageSquareHeart,
};

// Node positions on a 100x100 viewBox for the orchestration graph
const POSITIONS: Record<AgentId, { x: number; y: number }> = {
  story: { x: 50, y: 12 },
  tutor: { x: 80, y: 32 },
  visual: { x: 84, y: 66 },
  motion: { x: 58, y: 86 },
  editor: { x: 28, y: 84 },
  examiner: { x: 14, y: 52 },
  feedback: { x: 26, y: 22 },
};

const EDGES: [AgentId, AgentId][] = [
  ["story", "tutor"],
  ["tutor", "visual"],
  ["visual", "motion"],
  ["motion", "editor"],
  ["editor", "examiner"],
  ["examiner", "feedback"],
  ["feedback", "story"],
];

export default function Agents() {
  const { agents, load, runOrchestration, orchestrating } = useAgentStore();
  const [selected, setSelected] = useState<AgentId | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const activeAgent = agents.find((a) => a.id === selected);

  return (
    <PageContainer wide>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Study Assistants Hub
          </h1>
          <p className="mt-1 text-silver-600 dark:text-silver-600">
            Meet the AI helpers that prepare your flashcards, generate quizzes, and coordinate your learning path.
          </p>
        </div>
        <Button onClick={runOrchestration} loading={orchestrating}>
          <Play className="h-4 w-4" /> {orchestrating ? "Processing…" : "Update materials"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Graph */}
        <div className="lg:col-span-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-silver-300 bg-silver-900 dark:bg-abyss-900 dark:border-abyss-700/60 sm:aspect-[4/3]">
            <AmbientBackground variant="hero" particles={false} />
            <div className="absolute inset-0 cf-grid-bg opacity-25" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
              {EDGES.map(([from, to], i) => {
                const a = POSITIONS[from];
                const b = POSITIONS[to];
                const fromActive =
                  agents.find((x) => x.id === from)?.status === "complete";
                const toActive = agents.find((x) => x.id === to)?.status === "active";
                const live = fromActive && toActive;
                return (
                  <g key={i}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={live ? "#588dff" : "rgba(120,140,200,0.18)"}
                      strokeWidth={live ? 0.7 : 0.4}
                    />
                    {live && (
                      <motion.circle
                        r={1.1}
                        fill="#8db5ff"
                        initial={{ cx: a.x, cy: a.y }}
                        animate={{ cx: b.x, cy: b.y }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {agents.map((agent) => {
              const pos = POSITIONS[agent.id];
              const Icon = ICONS[agent.id];
              return (
                <motion.button
                  key={agent.id}
                  onClick={() => setSelected((s) => (s === agent.id ? null : agent.id))}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  animate={
                    agent.status === "active"
                      ? { scale: [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 1.2, repeat: agent.status === "active" ? Infinity : 0 }}
                  aria-label={`${agent.name}: ${agent.role}`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "relative flex h-11 w-11 items-center justify-center rounded-xl border transition-colors sm:h-14 sm:w-14",
                        selected === agent.id && "ring-2 ring-white ring-offset-2 ring-offset-abyss-950",
                        agent.status === "active"
                          ? "border-gold-400 bg-gold-500 text-white shadow-[0_0_24px] shadow-gold-500/60 dark:shadow-cobalt-500/60"
                          : agent.status === "complete"
                          ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                          : "border-white/10 bg-white/5 text-silver-600"
                      )}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      {agent.status === "active" && (
                        <motion.span
                          className="absolute inset-0 rounded-xl border border-gold-400"
                          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <span className="hidden text-[10px] font-medium text-silver-600 sm:block">
                      {agent.name.replace(" Agent", "")}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Selected agent detail */}
          <AnimatePresence>
            {activeAgent && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-silver-300 bg-white p-4 dark:border-abyss-700/60 dark:bg-abyss-800"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/15 text-gold-600">
                  {(() => {
                    const I = ICONS[activeAgent.id];
                    return <I className="h-5 w-5" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold tracking-tight">{activeAgent.name}</p>
                  <p className="text-sm text-silver-600 dark:text-silver-600">{activeAgent.role}</p>
                </div>
                <span className="text-xs font-medium capitalize text-gold-600">{activeAgent.status}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agent list */}
        <div className="space-y-3">
          {agents.map((agent) => {
            const Icon = ICONS[agent.id];
            return (
              <Card
                key={agent.id}
                interactive
                onClick={() => setSelected((s) => (s === agent.id ? null : agent.id))}
                className={cn(
                  "cursor-pointer",
                  selected === agent.id && "border-gold-400 dark:border-gold-400/50"
                )}
              >
                <CardBody className="flex items-center gap-3 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      agent.status === "active"
                        ? "bg-gold-500 text-white"
                        : agent.status === "complete"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-silver-200 text-silver-600 dark:bg-white/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="truncate text-xs text-silver-600">{agent.role}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium capitalize",
                      agent.status === "active"
                        ? "text-gold-600"
                        : agent.status === "complete"
                        ? "text-emerald-500"
                        : "text-silver-600"
                    )}
                  >
                    {agent.status}
                  </span>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
