import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, Trophy, RotateCcw, Loader2 } from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useStudyStore } from "../../stores/useStudyStore";
import { studyService } from "../../services/studyService";
import { cn } from "../../lib/utils";
import { MarkdownLite } from "../../components/tutor/MarkdownLite";

interface LocalQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export default function Quiz() {
  const { deckId } = useParams();
  const id = deckId || "";
  const navigate = useNavigate();
  const deck = useStudyStore((s) => s.documents.find((d) => d.document_id === id));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<LocalQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadQuiz() {
      setLoading(true);
      setError(null);
      try {
        const response = await studyService.generateQuiz(id);
        setQuizId(response.quiz_id);
        
        // Map backend format to local QuizQuestion format
        const mapped = response.questions.map((q: any, idx: number) => {
          const keys = ["A", "B", "C", "D"];
          return {
            id: String(idx),
            prompt: q.question,
            options: keys.map((k) => q.options[k]),
            answerIndex: keys.indexOf(q.correct_answer),
            explanation: q.explanation,
          };
        });
        setQuestions(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to load quiz. Please make sure the document is ready.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [id]);

  if (!deckId) return <Navigate to="/app/study" replace />;
  if (!deck) return <Navigate to="/app/study" replace />;

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  function select(qId: string, optIdx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qId]: optIdx }));
  }

  async function submit() {
    if (!quizId || submitting) return;
    setSubmitting(true);
    try {
      // Map local answers to backend format: { "0": "A", "1": "C", ... }
      const keys = ["A", "B", "C", "D"];
      const formattedAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([qId, optIdx]) => {
        formattedAnswers[qId] = keys[optIdx];
      });

      const res = await studyService.submitQuiz(quizId, formattedAnswers);
      setResult({
        score: res.percentage,
        correct: res.score,
        total: res.total,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err.message || "Failed to submit answers.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    // Reload a fresh quiz from backend
    navigate(0);
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`/app/study/${deck.document_id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-silver-600 transition hover:text-gold-600 dark:text-silver-600"
        >
          <ArrowLeft className="h-4 w-4" /> {deck.title}
        </button>
        {!submitted && !loading && (
          <Badge tone="neutral">
            {answeredCount} / {questions.length} answered
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          <p className="mt-4 text-sm text-silver-600">Generating fresh quiz questions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-500 font-medium">
          {error}
        </div>
      ) : (
        <>
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
                      <Button onClick={() => navigate(`/app/study/${deck.document_id}/review`)}>
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
            {questions.map((q, qi) => {
              const selected = answers[q.id];
              return (
                <Card key={q.id}>
                  <CardBody>
                    <div className="font-display font-semibold tracking-tight flex items-start gap-1">
                      <span className="text-gold-600">{qi + 1}.</span>
                      <div className="flex-1 text-left">
                        <MarkdownLite text={q.prompt} />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = selected === oi;
                        const isCorrect = oi === q.answerIndex;
                        const showState = submitted;
                        return (
                          <motion.button
                            key={opt}
                            whileTap={submitted ? {} : { scale: 0.98 }}
                            onClick={() => select(q.id, oi)}
                            disabled={submitted}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                              !showState &&
                                (isSelected
                                  ? "border-gold-400 bg-gold-500 dark:bg-gold-500/10 text-white dark:text-white"
                                  : "border-silver-300 hover:border-gold-400 dark:border-white/[0.08] dark:hover:border-gold-400/30"),
                              showState &&
                                isCorrect &&
                                "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                              showState &&
                                isSelected &&
                                !isCorrect &&
                                "border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
                              showState && !isCorrect && !isSelected && "border-silver-300 opacity-60 dark:border-abyss-700/60"
                            )}
                          >
                            <span className="flex-1 text-left"><MarkdownLite text={opt} /></span>
                            {showState && isCorrect && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                            {showState && isSelected && !isCorrect && <X className="h-4 w-4 shrink-0 text-rose-500" />}
                          </motion.button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 rounded-lg bg-silver-200 px-3 py-2 text-sm text-silver-600 dark:bg-white/[0.03] dark:text-silver-300 text-left"
                      >
                        <MarkdownLite text={q.explanation} />
                      </motion.div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {!submitted && (
            <div className="sticky bottom-4 mt-6 flex justify-center">
              <Button size="lg" onClick={submit} loading={submitting} disabled={!allAnswered} className="shadow-xl">
                {allAnswered ? "Submit quiz" : `Answer all ${questions.length} questions`}
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
