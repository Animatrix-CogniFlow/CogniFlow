import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ListChecks,
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Trophy,
  FileText,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { useStudyStore } from "../../stores/useStudyStore";
import { studyService } from "../../services/studyService";
import { timeAgo } from "../../lib/utils";

export default function DeckDetail() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const deck = useStudyStore((s) => s.decks.find((d) => d.id === deckId));
  const addCard = useStudyStore((s) => s.addCard);
  const deleteCard = useStudyStore((s) => s.deleteCard);
  const regenerate = useStudyStore((s) => s.regenerate);

  const [tab, setTab] = useState<"cards" | "quiz" | "notes">("cards");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  if (!deck) return <Navigate to="/app/study" replace />;

  const due = studyService.dueCards(deck.cards).length;
  const mastery = studyService.deckMastery(deck);
  const best = deck.attempts.length ? Math.max(...deck.attempts.map((a) => a.score)) : null;

  function handleAdd() {
    if (!front.trim() || !back.trim() || !deck) return;
    addCard(deck.id, front.trim(), back.trim());
    setFront("");
    setBack("");
  }

  return (
    <PageContainer>
      <button
        onClick={() => navigate("/app/study")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-silver-600 transition hover:text-gold-600 dark:text-silver-600"
      >
        <ArrowLeft className="h-4 w-4" /> All decks
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="flow">{deck.subject}</Badge>
            <span className="text-xs text-silver-600">Updated {timeAgo(deck.updatedAt)}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">{deck.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/app/study/${deck.id}/review`)} disabled={!deck.cards.length}>
            <Brain className="h-4 w-4" /> Review {due > 0 && `(${due})`}
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/app/study/${deck.id}/quiz`)} disabled={!deck.quiz.length}>
            <ListChecks className="h-4 w-4" /> Take quiz
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox icon={Brain} label="Flashcards" value={`${deck.cards.length}`} />
        <StatBox icon={Clock} label="Due now" value={`${due}`} tone={due > 0 ? "warning" : "neutral"} />
        <StatBox icon={Trophy} label="Best score" value={best !== null ? `${best}%` : "—"} />
        <StatBox icon={ListChecks} label="Mastery" value={`${mastery}%`} />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl border border-silver-300 bg-white/60 p-1 dark:border-abyss-700/60 dark:bg-abyss-800/60">
        {([
          ["cards", "Flashcards", Brain],
          ["quiz", "Quiz", ListChecks],
          ["notes", "Source notes", FileText],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === key ? "text-gold-600 dark:text-white" : "text-silver-600 dark:text-silver-600"
            }`}
          >
            {tab === key && (
              <motion.span
                layoutId="deck-tab"
                className="absolute inset-0 rounded-lg bg-gold-500 dark:bg-gold-500/10"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <AnimatePresence mode="wait">
          {tab === "cards" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Add card */}
              <Card className="mb-5">
                <CardBody>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Front (question)" value={front} onChange={(e) => setFront(e.target.value)} placeholder="What is…?" />
                    <Input label="Back (answer)" value={back} onChange={(e) => setBack(e.target.value)} placeholder="The answer…" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => regenerate(deck.id)}>
                      <RefreshCw className="h-4 w-4" /> Regenerate from notes
                    </Button>
                    <Button size="sm" onClick={handleAdd} disabled={!front.trim() || !back.trim()}>
                      <Plus className="h-4 w-4" /> Add card
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                {deck.cards.map((c) => (
                  <motion.div key={c.id} layout>
                    <Card className="group h-full">
                      <CardBody className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{c.front}</p>
                          <button
                            onClick={() => deleteCard(deck.id, c.id)}
                            aria-label="Delete card"
                            className="shrink-0 rounded p-1 text-silver-600 opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-2 border-t border-dashed border-silver-300 pt-2 text-sm text-silver-600 dark:border-white/10 dark:text-silver-600">
                          {c.back}
                        </p>
                        <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-silver-600">
                          <span>Reviews: {c.reviews}</span>
                          <span>·</span>
                          <span>
                            {c.dueAt <= Date.now()
                              ? "Due now"
                              : `Due ${timeAgo(c.dueAt).replace(" ago", " from now")}`}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <SpotlightCard className="p-6 text-center" tilt={false}>
                <ListChecks className="mx-auto h-8 w-8 text-gold-600" />
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
                  {deck.quiz.length} auto-generated questions
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-silver-600 dark:text-silver-600">
                  Multiple-choice questions generated from your notes, graded instantly with explanations.
                </p>
                <Button className="mt-5" onClick={() => navigate(`/app/study/${deck.id}/quiz`)} disabled={!deck.quiz.length}>
                  Start quiz
                </Button>
              </SpotlightCard>

              {deck.attempts.length > 0 && (
                <Card className="mt-5">
                  <CardBody>
                    <h4 className="mb-3 font-display font-semibold tracking-tight">Attempt history</h4>
                    <div className="space-y-2">
                      {deck.attempts.map((a) => (
                        <div key={a.id} className="flex items-center justify-between rounded-lg bg-silver-200 px-3 py-2 text-sm dark:bg-white/[0.03]">
                          <span className="text-silver-600 dark:text-silver-600">{timeAgo(a.takenAt)}</span>
                          <span>
                            {a.correct}/{a.total} correct
                          </span>
                          <Badge tone={a.score >= 70 ? "success" : a.score >= 40 ? "warning" : "neutral"}>
                            {a.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </motion.div>
          )}

          {tab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardBody>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-silver-600 dark:text-silver-600">
                    {deck.notes}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof Brain;
  label: string;
  value: string;
  tone?: "neutral" | "warning";
}) {
  return (
    <Card className="p-4">
      <Icon className={`h-5 w-5 ${tone === "warning" ? "text-amber-500" : "text-gold-600"}`} />
      <p className="mt-3 font-display text-xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-silver-600">{label}</p>
    </Card>
  );
}
