import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Layers,
  Brain,
  ListChecks,
  Trash2,
  Sparkles,
  Clock,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { StaggerGroup, StaggerItem } from "../../components/ui/Motion";
import { useStudyStore } from "../../stores/useStudyStore";
import { studyService } from "../../services/studyService";
import { timeAgo } from "../../lib/utils";

export default function Study() {
  const navigate = useNavigate();
  const decks = useStudyStore((s) => s.decks);
  const createDeck = useStudyStore((s) => s.createDeck);
  const deleteDeck = useStudyStore((s) => s.deleteDeck);

  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<{ cards: number; quiz: number } | null>(null);

  function previewGen(text: string) {
    setNotes(text);
    if (text.trim().length > 60) {
      const { cards, quiz } = studyService.generateFromText(text);
      setPreview({ cards: cards.length, quiz: quiz.length });
    } else {
      setPreview(null);
    }
  }

  async function handleCreate() {
    if (!title.trim() || notes.trim().length < 40) return;
    setGenerating(true);
    // brief delay so the generation feels intentional/cinematic
    await new Promise((r) => setTimeout(r, 650));
    const id = createDeck({ title, subject, notes, source: "manual" });
    setGenerating(false);
    setOpen(false);
    setTitle("");
    setSubject("");
    setNotes("");
    setPreview(null);
    navigate(`/app/study/${id}`);
  }

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Study Decks</h1>
          <p className="mt-1 text-silver-600 dark:text-silver-600">
            Create flashcard sets and practice quizzes from your study notes. Review them regularly to lock them in memory.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New deck
        </Button>
      </div>

      {decks.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No study sets yet"
          description="Create your first set of flashcards and quiz questions by pasting your study notes."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create a set
            </Button>
          }
        />
      ) : (
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const due = studyService.dueCards(deck.cards).length;
            const mastery = studyService.deckMastery(deck);
            const best = deck.attempts.length
              ? Math.max(...deck.attempts.map((a) => a.score))
              : null;
            return (
              <StaggerItem key={deck.id}>
                <motion.div whileHover={{ y: -4 }}>
                  <SpotlightCard className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between">
                      <Badge tone="flow">{deck.subject}</Badge>
                      <div className="flex items-center gap-2">
                        {due > 0 && (
                          <Badge tone="warning">
                            <Clock className="h-3 w-3" /> {due} due
                          </Badge>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmId(deck.id);
                          }}
                          aria-label="Delete deck"
                          className="rounded-md p-1.5 text-silver-600 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
                      {deck.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-silver-600">
                      <span className="inline-flex items-center gap-1">
                        <Brain className="h-3 w-3" /> {deck.cards.length} cards
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ListChecks className="h-3 w-3" /> {deck.quiz.length} quiz
                      </span>
                    </div>

                    {/* Mastery bar */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-silver-600">Mastery</span>
                        <span className="font-medium">{mastery}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-silver-200 dark:bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mastery}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                        />
                      </div>
                    </div>

                    {best !== null && (
                      <p className="mt-3 text-xs text-silver-600">
                        Best quiz score: <span className="font-medium text-emerald-500">{best}%</span>
                      </p>
                    )}

                    <div className="mt-auto flex gap-2 pt-5">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/app/study/${deck.id}/review`)}
                      >
                        <Brain className="h-4 w-4" /> Review
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => navigate(`/app/study/${deck.id}`)}
                      >
                        Open
                      </Button>
                    </div>
                    <p className="mt-2 text-[11px] text-silver-600">Updated {timeAgo(deck.updatedAt)}</p>
                  </SpotlightCard>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      {/* Create deck modal */}
      <Modal open={open} onClose={() => !generating && setOpen(false)} title="Create a Study Set">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Set Title"
              placeholder="e.g. Cell Biology Ch.4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Subject"
              placeholder="e.g. Biology"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-silver-600 dark:text-silver-600">
              Study notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => previewGen(e.target.value)}
              rows={6}
              placeholder="Paste your notes, definitions, or textbook passages here. We'll find the key terms and generate your flashcards and quiz questions."
              className="w-full resize-none rounded-xl border border-silver-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 dark:border-white/[0.08] dark:bg-abyss-800/60 dark:text-silver-600"
            />
            <AnimatePresence>
              {preview && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs text-gold-600 dark:text-gold-600"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Will generate {preview.cards} flashcards and {preview.quiz} quiz questions
                </motion.p>
              )}
            </AnimatePresence>
            {notes.trim().length > 0 && notes.trim().length < 40 && (
              <p className="text-xs text-amber-500">Add a little more text for better generation.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={generating}
              disabled={!title.trim() || notes.trim().length < 40}
            >
              <Sparkles className="h-4 w-4" /> Create Study Set
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Delete study set?">
        <p className="text-sm text-silver-600 dark:text-silver-600">
          This will permanently delete this study set, including all flashcards and quiz scores.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmId) deleteDeck(confirmId);
              setConfirmId(null);
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}


