import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Sparkles, FileText, ChevronDown,
  AlertCircle, Loader2, CheckCircle2, RotateCcw,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AmbientBackground } from "../../components/visuals/AmbientBackground";
import { aiService } from "../../services/aiService";
import type {
  OralExamStartResponse,
  OralAnswerResponse,
  OralExamResults,
  OralQuestion,
} from "../../services/aiService";
import { contentService } from "../../services/contentService";
import { useChatStore } from "../../stores/useChatStore";

// ── Stage machine ────────────────────────────────────────────
type Stage =
  | "select"       // choosing document + settings
  | "ready"        // exam started, question displayed, waiting
  | "recording"    // mic active
  | "analyzing"    // waiting for backend response
  | "between"      // showing feedback before next question
  | "complete";    // all questions done, results shown

export default function OralExam() {
  // ── Document selection ──
  const documents = useChatStore((s) => s.documents);
  const selectedDocId = useChatStore((s) => s.selectedDocumentId);
  const selectDocument = useChatStore((s) => s.selectDocument);
  const docsLoading = useChatStore((s) => s.documentsLoading);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  
  const [docDropOpen, setDocDropOpen] = useState(false);
  const docDropRef = useRef<HTMLDivElement>(null);

  // ── Exam state ──
  const [stage, setStage] = useState<Stage>("select");
  const [examId, setExamId] = useState<string | null>(null);
  const [question, setQuestion] = useState<OralQuestion | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [totalQ, setTotalQ] = useState(5);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [lastEval, setLastEval] = useState<OralAnswerResponse["evaluation"] | null>(null);
  const [results, setResults] = useState<OralExamResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Recording ──
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // ── Load documents on mount ──
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Close doc dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (docDropRef.current && !docDropRef.current.contains(e.target as Node))
        setDocDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Start exam ──────────────────────────────────────────────
  async function startExam() {
    if (!selectedDocId) return;
    setError(null);
    setTranscript([]);
    setLastEval(null);
    setResults(null);
    setQIndex(0);
    setStage("analyzing");

    try {
      const res: OralExamStartResponse = await aiService.startOralExam(
        selectedDocId,
        { count: totalQ, languageCode: "en" }
      );
      setExamId(res.exam_id);
      setTotalQ(res.total_questions);
      setQuestion(res.first_question);
      setTranscript([
        { id: uid("t"), speaker: "examiner", text: res.first_question.question },
      ]);
      setStage("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start exam.");
      setStage("select");
    }
  }

  // ── Recording controls ──────────────────────────────────────
  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start(250); // collect in 250ms chunks
      mediaRef.current = mr;
      setStage("recording");
    } catch {
      setError("Microphone access denied. Please allow mic access and try again.");
    }
  }

  async function stopAndSubmit() {
    if (!mediaRef.current || !examId || !question) return;
    setStage("analyzing");

    // Stop recorder and wait for final data
    await new Promise<void>((resolve) => {
      mediaRef.current!.onstop = () => resolve();
      mediaRef.current!.stop();
      mediaRef.current!.stream.getTracks().forEach((t) => t.stop());
    });

    try {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

      const res: OralAnswerResponse = await aiService.submitOralAnswer(
        examId,
        audioBlob
      );

      // Add student answer to transcript
      setTranscript((prev) => [
        ...prev,
        { id: uid("t"), speaker: "student", text: res.transcription },
      ]);

      setLastEval(res.evaluation);

      if (res.is_complete) {
        // Fetch full results
        const fullResults = await aiService.getOralExamResults(examId);
        setResults(fullResults);
        setStage("complete");
      } else if (res.next_question) {
        setStage("between");
        // next question ready when user clicks Continue
        setTimeout(() => {
          setQuestion(res.next_question!);
          setTranscript((prev) => [
            ...prev,
            { id: uid("t"), speaker: "examiner", text: res.next_question!.question },
          ]);
          setQIndex((i) => i + 1);
          setLastEval(null);
          setStage("ready");
        }, 2800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer.");
      setStage("ready");
    }
  }

  // ── Reset ───────────────────────────────────────────────────
  function reset() {
    setStage("select");
    setExamId(null);
    setQuestion(null);
    setTranscript([]);
    setLastEval(null);
    setResults(null);
    setError(null);
    setQIndex(0);
  }

  const selectedDoc = documents.find((d) => d.id === selectedDocId);
  const isActive = stage === "recording" || stage === "analyzing";

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Voice Practice Partner
        </h1>
        <p className="mt-1 text-sm text-silver-600 dark:text-cobalt-400/70">
          Practice speaking your answers out loud. Our AI tutor will help you improve and provide friendly tips on your understanding.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Select stage ── */}
      {stage === "select" && (
        <Card className="mx-auto max-w-md">
          <CardBody className="space-y-5">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Choose Your Study Material
            </h2>

            {/* Document picker */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-silver-700 dark:text-cobalt-300">
                Document
              </p>
              <div ref={docDropRef} className="relative">
                <button
                  onClick={() => setDocDropOpen((o) => !o)}
                  disabled={docsLoading}
                  className={cn(
                    "flex h-11 w-full items-center gap-2.5 rounded-xl border px-3.5 text-sm transition-colors",
                    "border-silver-300 bg-white text-silver-900 hover:border-gold-400",
                    "dark:border-abyss-700/60 dark:bg-abyss-800/60 dark:text-cobalt-100 dark:hover:border-cobalt-400/50",
                    docDropOpen && "border-gold-400 ring-2 ring-gold-400/20"
                  )}
                >
                  {docsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-silver-400" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-silver-400" />
                  )}
                  <span className="flex-1 truncate text-left">
                    {docsLoading
                      ? "Loading…"
                      : selectedDoc?.title ?? "Select a document"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-silver-400 transition-transform",
                      docDropOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {docDropOpen && documents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.13 }}
                      className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-52 overflow-y-auto rounded-xl border border-silver-200 bg-white p-1.5 shadow-lg dark:border-abyss-700/60 dark:bg-abyss-800"
                    >
                      {documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            selectDocument(doc.id);
                            setDocDropOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                            doc.id === selectedDocId
                              ? "bg-gold-500/10 text-gold-700 dark:bg-cobalt-600/20 dark:text-cobalt-200"
                              : "hover:bg-silver-100 dark:hover:bg-white/5"
                          )}
                        >
                          <FileText className="h-4 w-4 shrink-0 text-silver-400" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{doc.title}</p>
                            <p className="truncate text-[11px] text-silver-500 dark:text-cobalt-400/60">
                              {doc.subject}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-silver-700 dark:text-cobalt-300">
                Select Question Count
              </p>
              <div className="flex gap-2">
                {[3, 5, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTotalQ(n)}
                    className={cn(
                      "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                      n === totalQ
                        ? "border-gold-400 bg-gold-500/10 text-gold-700 dark:border-cobalt-400 dark:bg-cobalt-600/20 dark:text-cobalt-200"
                        : "border-silver-300 hover:border-gold-300 dark:border-white/10 dark:hover:border-cobalt-400/40"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={startExam}
              disabled={!selectedDocId || docsLoading}
            >
              <Mic className="h-4 w-4" /> Start Session
            </Button>
          </CardBody>
        </Card>
      )}

      {/* ── Active exam stages ── */}
      {(stage === "ready" ||
        stage === "recording" ||
        stage === "analyzing" ||
        stage === "between") && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Examiner stage */}
          <div className="lg:col-span-3">
            <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-silver-300 bg-silver-900 p-10 dark:border-abyss-700/60 dark:bg-abyss-900">
              <AmbientBackground variant="hero" particles={false} />
              <div className="absolute inset-0 cf-grid-bg opacity-25" />
              <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-500/20 blur-3xl" />

              {/* Progress indicator */}
              <div className="relative flex items-center gap-1.5">
                {Array.from({ length: totalQ }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-6 rounded-full transition-colors",
                      i < qIndex
                        ? "bg-emerald-400"
                        : i === qIndex
                        ? "bg-gold-400 dark:bg-cobalt-400"
                        : "bg-white/20"
                    )}
                  />
                ))}
              </div>

              <ExamOrb recording={stage === "recording"} analyzing={stage === "analyzing"} />

              <div className="relative mt-8 max-w-md text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-gold-400 dark:text-cobalt-300">
                  Topic {qIndex + 1} of {totalQ}
                </p>
                <p className="mt-2 text-lg text-white leading-relaxed">
                  {question?.question}
                </p>
                {question?.key_points && question.key_points.length > 0 && (
                  <p className="mt-2 text-xs text-white/40">
                    Tip: Try to mention: {question.key_points.slice(0, 2).join(", ")}
                  </p>
                )}
              </div>

              <Waveform active={stage === "recording"} />

              <Button
                size="lg"
                className="relative mt-8"
                variant={stage === "recording" ? "danger" : "primary"}
                onClick={stage === "recording" ? stopAndSubmit : startRecording}
                loading={stage === "analyzing" || stage === "between"}
                disabled={stage === "analyzing" || stage === "between"}
              >
                {stage === "recording" ? (
                  <><MicOff className="h-5 w-5" /> Stop & Answer</>
                ) : stage === "analyzing" ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Listening…</>
                ) : stage === "between" ? (
                  <><CheckCircle2 className="h-5 w-5" /> Moving on…</>
                ) : (
                  <><Mic className="h-5 w-5" /> Record Answer</>
                )}
              </Button>

              <button
                onClick={reset}
                className="relative mt-4 flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Cancel Session
              </button>
            </div>
          </div>

          {/* Transcript + feedback */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardBody>
                <h3 className="mb-3 font-display font-semibold tracking-tight">
                  Conversation History
                </h3>
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {transcript.map((t) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={t.speaker === "examiner" ? "" : "text-right"}
                      >
                        <p className="text-[11px] uppercase tracking-wider text-silver-500 dark:text-cobalt-400/60">
                          {t.speaker === "examiner" ? "Tutor" : "You"}
                        </p>
                        <p
                          className={cn(
                            "mt-1 inline-block rounded-2xl px-3.5 py-2 text-sm",
                            t.speaker === "examiner"
                              ? "bg-silver-200 dark:bg-white/5"
                              : "bg-gold-500 text-white dark:bg-cobalt-600"
                          )}
                        >
                          {t.text}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold-600 dark:text-cobalt-300" />
                  <h3 className="font-display font-semibold tracking-tight">
                    Feedback
                  </h3>
                </div>
                {lastEval ? (
                  <div className="space-y-4">
                    <Metric label="Score" value={lastEval.score * 10} />
                    <p className="text-sm text-silver-700 dark:text-cobalt-200">
                      {lastEval.feedback}
                    </p>
                    {lastEval.missed_points.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-silver-500 dark:text-cobalt-400/60">
                          Suggestions for improvement
                        </p>
                        <ul className="space-y-1">
                          {lastEval.missed_points.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-silver-600 dark:text-cobalt-300">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-silver-500 dark:text-cobalt-400/60">
                    Record your answer to receive friendly AI tips.
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ── Complete stage ── */}
      {stage === "complete" && results && (
        <div className="space-y-6">
          {/* Score banner */}
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-silver-300 bg-gradient-to-br from-silver-900 to-abyss-900 px-6 py-10 text-center dark:border-abyss-700/60">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <h2 className="font-display text-2xl font-semibold text-white">
              Session completed!
            </h2>
            <p className="text-white/60 text-sm">
              {results.title} · {results.subject}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold text-gold-400 dark:text-cobalt-300">
                {Math.round(results.average_score * 10)}%
              </span>
              <span className="text-white/40 text-sm">average grade</span>
            </div>
            <Button variant="secondary" onClick={reset} className="mt-4">
              <RotateCcw className="h-4 w-4" /> Start new session
            </Button>
          </div>

          {/* Per-question breakdown */}
          <div className="grid gap-4 sm:grid-cols-2">
            {results.answers.map((a, i) => (
              <Card key={a.question_id}>
                <CardBody>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-silver-500 dark:text-cobalt-400/60">
                      Topic {i + 1}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        a.evaluation.score >= 8
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : a.evaluation.score >= 5
                          ? "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      )}
                    >
                      {a.evaluation.score}/10
                    </span>
                  </div>
                  <p className="mb-2 text-sm font-medium">{a.question}</p>
                  <p className="mb-2 text-sm text-silver-600 dark:text-cobalt-300 italic">
                    "{a.transcription}"
                  </p>
                  <p className="text-xs text-silver-500 dark:text-cobalt-400/60">
                    {a.evaluation.feedback}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// ── Sub-components ───────────────────────────────────────────

function Metric({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 85
      ? "bg-emerald-500"
      : value >= 65
      ? "bg-gold-500 dark:bg-cobalt-400"
      : "bg-amber-500";
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="capitalize text-silver-600 dark:text-cobalt-300">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-silver-200 dark:bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${tone}`}
        />
      </div>
    </div>
  );
}

function ExamOrb({
  recording,
  analyzing,
}: {
  recording: boolean;
  analyzing: boolean;
}) {
  const active = recording || analyzing;
  return (
    <div className="relative mt-6 h-40 w-40">
      {active &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-gold-400/40 dark:border-cobalt-400/40"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-2xl shadow-gold-500/40 dark:from-cobalt-500 dark:to-cobalt-700 dark:shadow-cobalt-600/50"
        animate={active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{
          duration: 1.6,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {analyzing ? (
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </div>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const bars = Array.from({ length: 28 });
  return (
    <div className="relative mt-8 flex h-12 items-center gap-1" aria-hidden>
      {bars.map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-gold-500/70 dark:bg-cobalt-400/70"
          animate={
            active ? { height: [6, 8 + Math.random() * 30, 6] } : { height: 6 }
          }
          transition={{
            duration: 0.6 + Math.random() * 0.5,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{ height: 6 }}
        />
      ))}
    </div>
  );
}