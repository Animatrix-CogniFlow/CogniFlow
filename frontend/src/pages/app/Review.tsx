import { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Check, Sparkles, PartyPopper } from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useStudyStore } from "../../stores/useStudyStore";
import { studyService } from "../../services/studyService";
import type { ReviewGrade } from "../../lib/types";

const GRADES: { grade: ReviewGrade; label: string; sub: string; cls: string }[] = [
  { grade: "again", label: "Again", sub: "< 1m", cls: "bg-rose-500 hover:bg-rose-400" },
  { grade: "hard", label: "Hard", sub: "soon", cls: "bg-amber-500 hover:bg-amber-400" },
  { grade: "good", label: "Good", sub: "1–6d", cls: "bg-gold-500 hover:bg-gold-500" },
  { grade: "easy", label: "Easy", sub: "longer", cls: "bg-emerald-600 hover:bg-emerald-500" },
];

export default function Review() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const deck = useStudyStore((s) => s.documents.find((d) => d.document_id === deckId));
  const reviewCard = useStudyStore((s) => s.reviewCard);

  // Snapshot the due queue once at session start so grading doesn't reshuffle mid-session.
  const queue = useMemo(() => {
    if (!deck) return [];
    const cards = deck.flashcards ?? [];
    const due = studyService.dueCards(cards);
    return (due.length ? due : cards).map((c) => c.id);
  }, [deck?.document_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const currentId = queue[pos];
  const card = deck?.flashcards?.find((c) => c.id === currentId);
  const finished = pos >= queue.length;

  const grade = useCallback(
    (g: ReviewGrade) => {
      if (!deck || !currentId) return;
      reviewCard(deck.document_id, currentId, g);
      setDone((d) => d + 1);
      setFlipped(false);
      setPos((p) => p + 1);
    },
    [deck, currentId, reviewCard]
  );

  // Keyboard: space to flip, 1-4 to grade
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        grade(GRADES[Number(e.key) - 1].grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, finished, grade]);

  if (!deck) return <Navigate to="/app/study" replace />;

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`/app/study/${deck.document_id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-silver-600 transition hover:text-gold-600 dark:text-silver-600"
        >
          <ArrowLeft className="h-4 w-4" /> {deck.title}
        </button>
        {!finished && (
          <Badge tone="neutral">
            {pos + 1} / {queue.length}
          </Badge>
        )}
      </div>

      {/* Progress */}
      {!finished && (
        <div className="mx-auto mb-8 h-1.5 max-w-2xl overflow-hidden rounded-full bg-silver-200 dark:bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
            animate={{ width: `${(pos / Math.max(1, queue.length)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {finished ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <PartyPopper className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Session complete</h2>
            <p className="mt-2 text-silver-600 dark:text-silver-600">
              You reviewed {done} {done === 1 ? "card" : "cards"}. Spaced-repetition has rescheduled them
              based on how well you recalled each one.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => navigate(`/app/study/${deck.document_id}/quiz`)}>
                Take the quiz
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/app/study/${deck.document_id}`)}>
                Back to deck
              </Button>
            </div>
          </motion.div>
        ) : card ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl"
          >
            {/* Flip card */}
            <div
              className="relative cursor-pointer select-none"
              style={{ perspective: 1400 }}
              onClick={() => setFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              aria-label="Flashcard. Press space to flip."
            >
              <motion.div
                className="relative h-72 w-full sm:h-80"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-silver-300 bg-white p-8 text-center shadow-lg dark:border-abyss-700/60 dark:bg-abyss-800"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="mb-4 text-xs font-medium uppercase tracking-wider text-silver-600">
                    Question
                  </span>
                  <p className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                    {card.front}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-silver-600">
                    <RotateCcw className="h-3.5 w-3.5" /> Tap or press space to flip
                  </span>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-gold-400/40 bg-gradient-to-br from-gold-400 to-white p-8 text-center shadow-lg dark:border-gold-400/20 dark:from-gold-400/10 dark:to-abyss-850"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gold-600">
                    <Sparkles className="h-3.5 w-3.5" /> Answer
                  </span>
                  <p className="text-lg leading-relaxed sm:text-xl">{card.back}</p>
                </div>
              </motion.div>
            </div>

            {/* Grade controls */}
            <AnimatePresence>
              {flipped ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 grid grid-cols-4 gap-2"
                >
                  {GRADES.map((g, i) => (
                    <button
                      key={g.grade}
                      onClick={() => grade(g.grade)}
                      className={`flex flex-col items-center rounded-xl py-3 text-white transition-colors ${g.cls}`}
                    >
                      <span className="text-sm font-semibold">{g.label}</span>
                      <span className="text-[11px] opacity-80">{g.sub}</span>
                      <span className="mt-1 hidden text-[10px] opacity-60 sm:block">press {i + 1}</span>
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-center"
                >
                  <Button onClick={() => setFlipped(true)}>
                    <Check className="h-4 w-4" /> Show answer
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageContainer>
  );
}
