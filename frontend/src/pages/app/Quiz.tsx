import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, Trophy, RotateCcw } from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useStudyStore } from "../../stores/useStudyStore";
import { cn } from "../../lib/utils";

export default function Quiz() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const deck = useStudyStore((s) => s.decks.find((d) => d.id === deckId));
  const recordAttempt = useStudyStore((s) => s.recordAttempt);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);

  if (!deck) return <Navigate to="/app/study" replace />;
  if (!deck.quiz.length) return <Navigate to={`/app/study/${deck.id}`} replace />;

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === deck.quiz.length;

  function select(qId: string, optIdx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qId]: optIdx }));
  }

  function submit() {
    const r = recordAttempt(deck!.id, answers);
    setResult(r);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`/app/study/${deck.id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-silver-600 transition hover:text-gold-600 dark:text-silver-600"
        >
          <ArrowLeft className="h-4 w-4" /> {deck.title}
        </button>
        {!submitted && (
          <Badge tone="flow">
            {answeredCount} / {deck.quiz.length} answered
          </Badge>
        )}
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {submitted && result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card>
              <CardBody className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-2xl font-display text-xl font-semibold",
                      result.score >= 70
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : result.score >= 40
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                    )}
                  >
                    {result.score}%
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold tracking-tight">
                      {result.score >= 70 ? "Great work!" : result.score >= 40 ? "Keep going" : "Review and retry"}
                    </h2>
                    <p className="text-sm text-silver-600 dark:text-silver-600">
                      {result.correct} of {result.total} correct
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={retry}>
                    <RotateCcw className="h-4 w-4" /> Retry
                  </Button>
                  <Button onClick={() => navigate(`/app/study/${deck.id}/review`)}>
                    <Trophy className="h-4 w-4" /> Review cards
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions */}
      <div className="space-y-5">
        {deck.quiz.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <Card key={q.id}>
              <CardBody>
                <p className="font-display font-semibold tracking-tight">
                  <span className="text-gold-600">{qi + 1}.</span> {q.prompt}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = selected === oi;
                    const isCorrect = oi === q.answerIndex;
                    const showState = submitted;
                    return (
                      <motion.button
                        key={oi}
                        whileTap={{ scale: submitted ? 1 : 0.98 }}
                        onClick={() => select(q.id, oi)}
                        disabled={submitted}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                          !showState &&
                            (isSelected
                              ? "border-gold-400 bg-gold-500 dark:bg-gold-500/10"
                              : "border-silver-300 hover:border-gold-400 dark:border-white/[0.08] dark:hover:border-gold-400/30"),
                          showState &&
                            isCorrect &&
                            "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
                          showState &&
                            isSelected &&
                            !isCorrect &&
                            "border-rose-400 bg-rose-50 dark:bg-rose-500/10",
                          showState && !isCorrect && !isSelected && "border-silver-300 opacity-60 dark:border-abyss-700/60"
                        )}
                      >
                        <span>{opt}</span>
                        {showState && isCorrect && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                        {showState && isSelected && !isCorrect && <X className="h-4 w-4 shrink-0 text-rose-500" />}
                      </motion.button>
                    );
                  })}
                </div>

                {submitted && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 rounded-lg bg-silver-200 px-3 py-2 text-sm text-silver-600 dark:bg-white/[0.03] dark:text-silver-600"
                  >
                    {q.explanation}
                  </motion.p>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {!submitted && (
        <div className="sticky bottom-4 mt-6 flex justify-center">
          <Button size="lg" onClick={submit} disabled={!allAnswered} className="shadow-xl">
            {allAnswered ? "Submit quiz" : `Answer all ${deck.quiz.length} questions`}
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
