import { Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  MessagesSquare,
  Mic,
  Layers,
  Clock,
  Brain,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { StatWidget } from "../../components/dashboard/StatWidget";
import { SessionCard } from "../../components/dashboard/SessionCard";
import { Card, CardBody, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Loader";
import { StaggerGroup, StaggerItem } from "../../components/ui/Motion";
import { useSessions } from "../../hooks/useSessions";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAgentStore } from "../../stores/useAgentStore";
import { useStudyStore } from "../../stores/useStudyStore";
import { studyService } from "../../services/studyService";

const QUICK_ACTIONS = [
  { icon: Layers, label: "Study decks", to: "/app/study", tone: "from-gold-400 to-gold-600" },
  { icon: Upload, label: "Upload notes", to: "/app/upload", tone: "from-violet-500 to-violet-700" },
  { icon: MessagesSquare, label: "Chat with the tutor", to: "/app/tutor", tone: "from-cyan-500 to-blue-600" },
  { icon: Mic, label: "Practice oral exam", to: "/app/oral", tone: "from-emerald-500 to-teal-600" },
];

export default function Dashboard() {
  const { sessions, loading } = useSessions();
  const user = useAuthStore((s) => s.user);
  const { orchestrating, runOrchestration } = useAgentStore();
  const decks = useStudyStore((s) => s.decks);
  const seedIfEmpty = useStudyStore((s) => s.seedIfEmpty);

  useEffect(() => {
    seedIfEmpty();
  }, [seedIfEmpty]);

  const totalDue = decks.reduce((n, d) => n + studyService.dueCards(d.cards).length, 0);
  const totalCards = decks.reduce((n, d) => n + d.cards.length, 0);
  const masteredCards = decks.reduce(
    (n, d) => n + d.cards.filter((c) => c.repetitions >= 2 && c.interval >= 6).length,
    0
  );
  const attempts = decks.flatMap((d) => d.attempts);
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((n, a) => n + a.score, 0) / attempts.length)
    : 0;

  return (
    <PageContainer>
      {/* Greeting */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Welcome back, {user?.name?.split(" ")[0] ?? "Learner"}.
        </motion.h1>
        <p className="mt-1 text-silver-600 dark:text-silver-600">
          Your personalized study space is ready.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatWidget icon={Layers} label="Study decks" numeric={decks.length} />
        <StatWidget icon={Clock} label="Cards due now" numeric={totalDue} />
        <StatWidget icon={Brain} label="Concepts mastered" numeric={masteredCards} />
        <StatWidget icon={TrendingUp} label="Avg. quiz score" numeric={avgScore} suffix="%" />
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Quick actions</h2>
        <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <StaggerItem key={a.label}>
              <Link to={a.to}>
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-2xl border border-silver-300 bg-white p-5 dark:border-abyss-700/60 dark:bg-abyss-800"
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.tone} text-white shadow-lg`}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{a.label}</p>
                  <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-silver-600 transition-all group-hover:translate-x-1 group-hover:text-gold-600" />
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Continue learning */}
        <div className="lg:col-span-2">
          {/* Your study decks */}
          {decks.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold tracking-tight">Your study decks</h2>
                <Link to="/app/study" className="text-sm text-gold-600 hover:underline dark:text-gold-600">
                  View all
                </Link>
              </div>
              <StaggerGroup className="grid gap-4 sm:grid-cols-2">
                {decks.slice(0, 4).map((d) => {
                  const due = studyService.dueCards(d.cards).length;
                  return (
                    <StaggerItem key={d.id}>
                      <Link to={`/app/study/${d.id}`}>
                        <motion.div
                          whileHover={{ y: -3 }}
                          className="group flex items-center gap-3 rounded-2xl border border-silver-300 bg-white p-4 transition-colors hover:border-gold-400 dark:border-abyss-700/60 dark:bg-abyss-800 dark:hover:border-gold-400/30"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700 dark:bg-cobalt-500/10 dark:text-cobalt-300">
                            <Layers className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{d.title}</p>
                            <p className="text-xs text-silver-600">
                              {d.cards.length} cards · {d.quiz.length} quiz
                            </p>
                          </div>
                          {due > 0 ? (
                            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                              {due} due
                            </span>
                          ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 text-silver-600 transition-all group-hover:translate-x-1 group-hover:text-gold-600" />
                          )}
                        </motion.div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">Continue learning</h2>
            <Link to="/app/lab" className="text-sm text-gold-600 hover:underline dark:text-gold-600">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          {/* Due for review */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-gold-600" /> Due for review
              </CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              {totalDue > 0 ? (
                <>
                  <p className="text-sm text-silver-600 dark:text-silver-600">
                    You have <span className="font-semibold text-gold-600 dark:text-gold-600">{totalDue}</span>{" "}
                    {totalDue === 1 ? "card" : "cards"} ready for spaced-repetition review across {decks.length}{" "}
                    {decks.length === 1 ? "deck" : "decks"}.
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {decks
                      .filter((d) => studyService.dueCards(d.cards).length > 0)
                      .slice(0, 3)
                      .map((d) => (
                        <Link
                          key={d.id}
                          to={`/app/study/${d.id}/review`}
                          className="flex items-center justify-between rounded-lg bg-silver-200 px-3 py-2 text-sm transition hover:bg-gold-500 dark:bg-white/[0.03] dark:hover:bg-gold-500/10"
                        >
                          <span className="truncate">{d.title}</span>
                          <span className="shrink-0 font-medium text-amber-500">
                            {studyService.dueCards(d.cards).length}
                          </span>
                        </Link>
                      ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-silver-600 dark:text-silver-600">
                  You're all caught up — no cards due right now. {totalCards > 0 ? `(${totalCards} total)` : ""}
                </p>
              )}
              <Link to="/app/study">
                <Button className="mt-4 w-full" variant="secondary">
                  <Layers className="h-4 w-4" /> Open study decks
                </Button>
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Study Assistant Status</CardTitle>
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`absolute inline-flex h-full w-full rounded-full ${orchestrating ? "bg-emerald-400 [animation:cf-pulse-ring_1.4s_ease-out_infinite]" : ""}`} />
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${orchestrating ? "bg-emerald-500" : "bg-gold-500"}`} />
                </span>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-silver-600 dark:text-silver-600">
                {orchestrating
                  ? "Our AI assistants are busy organizing your study materials."
                  : "Your assistant is ready to help you study."}
              </p>
              <Button
                className="mt-4 w-full"
                variant="secondary"
                onClick={runOrchestration}
                loading={orchestrating}
              >
                {orchestrating ? "Processing…" : "Update materials"}
              </Button>
              <Link to="/app/agents" className="mt-2 block text-center text-sm text-gold-600 hover:underline dark:text-gold-600">
                View study assistants
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Analytics preview</CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              <MiniChart />
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function MiniChart() {
  const bars = [40, 65, 50, 80, 60, 92, 74];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div>
      <div className="flex h-28 items-end gap-2">
        {bars.map((b, i) => (
          <div key={i} className="group relative flex flex-1 items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${b}%` }}
              whileHover={{ scaleY: 1.05 }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="w-full origin-bottom cursor-pointer rounded-t-md bg-gradient-to-t from-gold-400/70 to-gold-600 transition-colors group-hover:from-gold-400 group-hover:to-gold-600"
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-silver-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white dark:text-abyss-900">
              {b}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 text-center text-[11px] text-silver-600">
        {days.map((d, i) => (
          <span key={i} className="flex-1">{d}</span>
        ))}
      </div>
    </div>
  );
}
