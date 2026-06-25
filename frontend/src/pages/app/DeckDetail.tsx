import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ListChecks,
  ArrowLeft,
  Clock,
  Trophy,
  FileText,
  Loader2,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useStudyStore } from "../../stores/useStudyStore";
import { studyService } from "../../services/studyService";
export default function DeckDetail() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const id = deckId || "";

  const getDocument = useStudyStore((s) => s.getDocument);
  const saveFlashcards = useStudyStore((s) => s.saveFlashcards);
  
  const deck = useStudyStore((s) => s.documents.find((d) => d.document_id === id));

  const [tab, setTab] = useState<"cards" | "quiz" | "notes">("cards");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      const currentDeck = getDocument(id);
      if (currentDeck && currentDeck.flashcards && currentDeck.flashcards.length > 0) {
        return; // Already loaded!
      }

      setLoading(true);
      setError(null);
      try {
        // Try fetching existing flashcards
        let set = await studyService.getFlashcards(id).catch(async () => {
          // If not found, try generating
          return studyService.generateFlashcards(id);
        });

        if (set && set.flashcards) {
          saveFlashcards(id, set.flashcard_set_id, set.flashcards);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load flashcards.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [deckId, getDocument, saveFlashcards]);

  if (!deckId) return <Navigate to="/app/study" replace />;

  // Display a placeholder / redirect if deck registration not found
  if (!deck) {
    return (
      <PageContainer>
        <div className="flex h-60 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          <p className="mt-4 text-sm text-silver-600">Registering deck details...</p>
        </div>
      </PageContainer>
    );
  }

  const cards = deck.flashcards ?? [];
  const due = studyService.dueCards(cards).length;
  const mastery = studyService.deckMastery({ cards } as any);

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
            <Badge tone="neutral">{deck.subject}</Badge>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">{deck.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/app/study/${deck.document_id}/review`)} disabled={cards.length === 0}>
            <Brain className="h-4 w-4" /> Review {due > 0 && `(${due})`}
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/app/study/${deck.document_id}/quiz`)}>
            <ListChecks className="h-4 w-4" /> Take quiz
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox icon={Brain} label="Flashcards" value={`${cards.length}`} />
        <StatBox icon={Clock} label="Due now" value={`${due}`} tone={due > 0 ? "warning" : "neutral"} />
        <StatBox icon={Trophy} label="Mastery" value={`${mastery}%`} />
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
              {loading ? (
                <div className="flex py-12 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gold-500 mr-2" />
                  <span className="text-sm text-silver-600">Retrieving flashcards from AI...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-rose-500 font-medium">
                  {error}
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-12 text-silver-500 font-medium">
                  No flashcards found for this document.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {cards.map((c) => (
                    <motion.div key={c.id} layout>
                      <Card className="group h-full">
                        <CardBody className="flex h-full flex-col">
                          <p className="text-sm font-medium">{c.front}</p>
                          <p className="mt-2 border-t border-dashed border-silver-300 pt-2 text-sm text-silver-600 dark:border-white/10 dark:text-silver-600">
                            {c.back}
                          </p>
                          <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-silver-600">
                            <span>Reviews: {c.reviews || 0}</span>
                            <span>·</span>
                            <span>Interval: {c.interval || 0}d</span>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
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
                  Auto-generated Interactive Quiz
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-silver-600 dark:text-silver-600">
                  Multiple-choice questions generated from your uploaded document, graded instantly with explanation feedback.
                </p>
                <Button className="mt-5" onClick={() => navigate(`/app/study/${deck.document_id}/quiz`)}>
                  Start quiz
                </Button>
              </SpotlightCard>
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
                    This study set was auto-generated from your uploaded document. You can manage or replace the source document in the upload panel.
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
