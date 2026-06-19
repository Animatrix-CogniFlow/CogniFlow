import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Atom, 
  Maximize2, 
  Sigma, 
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw,
  Loader2,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  ChevronDown
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AmbientBackground } from "../../components/visuals/AmbientBackground";
import { aiService, type Scene, type SceneScript, type AnimationResponse } from "../../services/aiService";
import { contentService } from "../../services/contentService";
import { useChatStore } from "../../stores/useChatStore";
import { cn } from "../../lib/utils";

export default function VisualLab() {
  const documents = useChatStore((s) => s.documents);
  const selectedDocId = useChatStore((s) => s.selectedDocumentId);
  const selectDocument = useChatStore((s) => s.selectDocument);
  const docsLoading = useChatStore((s) => s.documentsLoading);

  const [docDropOpen, setDocDropOpen] = useState(false);
  const docDropRef = useRef<HTMLDivElement>(null);

  // Concept & Animation State
  const [concepts, setConcepts] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  // Topics / Chapters Outline State
  const [topics, setTopics] = useState<any[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicLoading, setTopicLoading] = useState<string | null>(null);
  
  const [animationScript, setAnimationScript] = useState<SceneScript | null>(null);
  const [animationId, setAnimationId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  
  // Feedback / Simplification state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [regenAttempt, setRegenAttempt] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (docDropRef.current && !docDropRef.current.contains(e.target as Node))
        setDocDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch topics and existing concepts when selectedDocId changes
  useEffect(() => {
    if (selectedDocId) {
      setTopicsLoading(true);
      setError(null);
      setSelectedConcept(null);
      setSelectedTopic(null);
      setAnimationScript(null);
      setAnimationId(null);
      setIsPlaying(false);
      setConcepts([]);
      
      contentService.getDocument(selectedDocId)
        .then((doc) => {
          setTopics(doc.topics || []);
          setConcepts(doc.key_concepts || []);
        })
        .catch(() => {
          setError("Failed to fetch topics for this document.");
        })
        .finally(() => {
          setTopicsLoading(false);
        });
    } else {
      setTopics([]);
      setConcepts([]);
    }
  }, [selectedDocId]);

  // Handle selecting/opening a topic and fetching its concepts lazily
  async function handleSelectTopic(topicName: string) {
    if (selectedTopic === topicName) {
      setSelectedTopic(null);
      return;
    }
    setSelectedTopic(topicName);

    // Check if concepts are already fetched for this topic
    const hasConcepts = concepts.some(
      (c) => c.extracted_for_topic?.toLowerCase() === topicName.toLowerCase()
    );
    if (hasConcepts) return;

    setTopicLoading(topicName);
    setError(null);
    try {
      const res = await contentService.lazyFetchConcepts(selectedDocId!, topicName);
      setConcepts((prev) => {
        const withoutNew = prev.filter(
          (c) => c.extracted_for_topic?.toLowerCase() !== topicName.toLowerCase()
        );
        return [...withoutNew, ...res.concepts];
      });
    } catch (err: any) {
      setError(err.message || `Failed to extract concepts for ${topicName}`);
    } finally {
      setTopicLoading(null);
    }
  }

  // Handle playing introductory overview animation
  async function playIntroOverview() {
    if (!selectedDocId) return;
    setGenerating(true);
    setError(null);
    setAnimationScript(null);
    setIsPlaying(false);
    
    try {
      const res = await aiService.generateIntroAnimation(selectedDocId);
      setAnimationScript(res.scene_script);
      setAnimationId(res.animation_id);
      setSceneIndex(0);
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate introductory animation.");
    } finally {
      setGenerating(false);
    }
  }

  // Handle playing specific concept animation
  async function playConceptAnimation(conceptName: string) {
    if (!selectedDocId) return;
    setSelectedConcept(conceptName);
    setGenerating(true);
    setError(null);
    setAnimationScript(null);
    setIsPlaying(false);
    setRegenAttempt(1);
    
    try {
      const res = await aiService.generateConceptAnimation(selectedDocId, conceptName);
      setAnimationScript(res.scene_script);
      setAnimationId(res.animation_id);
      setSceneIndex(0);
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate concept animation.");
    } finally {
      setGenerating(false);
    }
  }

  // Handle animation satisfaction
  async function handleUnderstand(satisfied: boolean) {
    if (!animationId) return;
    
    if (satisfied) {
      try {
        await aiService.evaluateAnimation(animationId, true);
        alert("Awesome! Glad this explanation helped. You can now test your knowledge in the Quiz or Oral Exam!");
        setIsPlaying(false);
        setAnimationScript(null);
        setSelectedConcept(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowFeedbackModal(true);
    }
  }

  // Handle simplify (Regeneration request)
  async function submitSimplification() {
    if (!animationId) return;
    setSubmittingFeedback(true);
    setError(null);
    
    try {
      // Send optional feedback and trigger evaluation
      const evalRes = await aiService.evaluateAnimation(animationId, false, feedbackText);
      
      if (evalRes.action === "tutor") {
        alert("Maximum explanation attempts reached. We'll redirect you to our interactive AI Tutor for personalized guidance.");
        setShowFeedbackModal(false);
        setIsPlaying(false);
        setAnimationScript(null);
      } else {
        // Trigger regeneration
        const regenRes = await aiService.regenerateAnimation(animationId);
        setAnimationScript(regenRes.scene_script);
        setAnimationId(regenRes.animation_id);
        setRegenAttempt(regenRes.attempt || 2);
        setSceneIndex(0);
        setShowFeedbackModal(false);
        setFeedbackText("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to simplify this animation.");
    } finally {
      setSubmittingFeedback(false);
    }
  }

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <PageContainer wide>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Visual Learning Lab</h1>
          <p className="mt-1 text-sm text-silver-600 dark:text-silver-400">
            Interactive STEM visualizations dynamically rendered on canvas.
          </p>
        </div>
        
        {/* Document Selection Dropdown */}
        <div ref={docDropRef} className="relative">
          <button
            onClick={() => setDocDropOpen((o) => !o)}
            disabled={docsLoading}
            className={cn(
              "flex h-11 min-w-[200px] items-center gap-2.5 rounded-xl border px-3.5 text-sm transition-colors bg-white",
              "border-silver-300 text-silver-900 hover:border-gold-400 dark:border-white/10 dark:bg-abyss-800 dark:text-white dark:hover:border-gold-500/50"
            )}
          >
            {docsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-silver-400" />
            ) : (
              <FileText className="h-4 w-4 shrink-0 text-gold-500" />
            )}
            <span className="flex-1 truncate text-left">
              {docsLoading ? "Loading..." : selectedDoc?.title ?? "Choose a document"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-silver-400" />
          </button>

          <AnimatePresence>
            {docDropOpen && documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-52 w-64 overflow-y-auto rounded-xl border border-silver-200 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-abyss-800"
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
                        ? "bg-gold-500/10 text-gold-700 dark:bg-gold-500/20 dark:text-white"
                        : "hover:bg-silver-100 dark:hover:bg-white/5 dark:text-silver-300"
                    )}
                  >
                    <FileText className="h-4 w-4 shrink-0 text-silver-400" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{doc.title}</p>
                      <p className="truncate text-[11px] text-silver-500">{doc.subject}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!selectedDocId ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <CardBody className="max-w-md flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gold-500/10 flex items-center justify-center mb-6">
              <Atom className="h-8 w-8 text-gold-500 animate-pulse" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No active document context</h3>
            <p className="text-silver-600 dark:text-silver-400 mb-6 text-sm">
              Please select a textbook or upload notes to generate concept blueprints and visualize complex formulas.
            </p>
            {documents.length > 0 ? (
              <Button onClick={() => setDocDropOpen(true)}>Choose from Decks</Button>
            ) : (
              <Button onClick={() => selectDocument("")}>Upload a File</Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          
          {/* Concepts Directory Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardBody className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-silver-200 dark:border-white/10 pb-3">
                  <h3 className="font-semibold text-sm tracking-wider uppercase text-silver-500">Document Hub</h3>
                </div>
                
                <Button 
                  onClick={playIntroOverview} 
                  variant="outline" 
                  className="w-full flex items-center justify-start border-gold-500/30 text-gold-600 hover:bg-gold-500/5"
                  disabled={generating}
                >
                  {generating && !selectedConcept ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-gold-500" />
                  )}
                  Play Intro Animation
                </Button>
              </CardBody>
            </Card>

            <Card className="max-h-[500px] overflow-y-auto">
              <CardBody className="p-4">
                <h3 className="font-semibold text-sm tracking-wider uppercase text-silver-500 border-b border-silver-200 dark:border-white/10 pb-3 mb-3">
                  Topics Outline ({topics.length})
                </h3>
                
                {topicsLoading ? (
                  <div className="py-10 text-center flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
                    <span className="text-xs text-silver-500">Loading outline...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topics.map((t, idx) => {
                      const isExpanded = selectedTopic === t.topic_name;
                      const isLoading = topicLoading === t.topic_name;
                      const topicConcepts = concepts.filter(
                        (c) => c.extracted_for_topic?.toLowerCase() === t.topic_name.toLowerCase()
                      );

                      return (
                        <div key={idx} className="border border-silver-100 dark:border-white/5 rounded-xl overflow-hidden bg-silver-50/50 dark:bg-white/[0.01]">
                          <button
                            onClick={() => handleSelectTopic(t.topic_name)}
                            className={cn(
                              "w-full text-left px-3 py-3 text-sm font-medium transition-all flex items-center justify-between gap-2.5",
                              isExpanded ? "text-gold-500 bg-gold-500/5" : "text-silver-900 dark:text-silver-300 hover:bg-silver-100 dark:hover:bg-white/5"
                            )}
                          >
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{t.topic_name}</p>
                              <p className="text-[10px] text-silver-500 truncate mt-0.5">{t.brief_description}</p>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-silver-400", isExpanded && "rotate-180")} />
                          </button>

                          {isExpanded && (
                            <div className="p-2 border-t border-silver-100 dark:border-white/5 space-y-1 bg-white dark:bg-abyss-900/50">
                              {isLoading ? (
                                <div className="py-4 text-center flex flex-col items-center gap-1.5">
                                  <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
                                  <span className="text-[10px] text-silver-500">Extracting key concepts...</span>
                                </div>
                              ) : topicConcepts.length > 0 ? (
                                topicConcepts.map((c, i) => (
                                  <button
                                    key={i}
                                    onClick={() => playConceptAnimation(c.concept)}
                                    disabled={generating}
                                    className={cn(
                                      "w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start gap-2 border border-transparent",
                                      selectedConcept === c.concept
                                        ? "bg-gold-500/10 border-gold-500/30 text-gold-700 dark:text-white font-medium"
                                        : "hover:bg-silver-100 dark:hover:bg-white/5 text-silver-600 dark:text-silver-400"
                                    )}
                                  >
                                    <Play className="h-3 w-3 mt-0.5 shrink-0 text-silver-400" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium truncate">{c.concept}</p>
                                      <span className={cn(
                                        "inline-block text-[9px] uppercase font-bold tracking-wider mt-0.5 px-1.5 py-0.2 rounded-full",
                                        c.complexity === "advanced" 
                                          ? "bg-rose-500/10 text-rose-500"
                                          : c.complexity === "intermediate"
                                          ? "bg-gold-500/10 text-gold-600"
                                          : "bg-emerald-500/10 text-emerald-600"
                                      )}>
                                        {c.complexity}
                                      </span>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <p className="text-center text-[10px] text-silver-500 py-2">No concepts found for this topic.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Interactive Rendering Canvas */}
          <div className="lg:col-span-3 space-y-4">
            {generating ? (
              <div className="relative min-h-[550px] rounded-3xl border border-silver-300 bg-abyss-950 flex flex-col items-center justify-center p-8 shadow-2xl dark:border-abyss-700/60">
                <AmbientBackground variant="hero" particles={true} />
                <Loader2 className="h-10 w-10 animate-spin text-gold-500 mb-4" />
                <p className="text-white text-lg font-medium">Orchestrating visual structures...</p>
                <p className="text-silver-500 text-xs mt-1">Gemini is outputting structured animation keyframes.</p>
              </div>
            ) : isPlaying && animationScript ? (
              <div className="space-y-4">
                
                {/* Canvas Container */}
                <div className="relative overflow-hidden rounded-3xl border border-silver-300 bg-abyss-950 min-h-[500px] flex flex-col justify-between p-8 dark:border-abyss-700/60 shadow-2xl">
                  <AmbientBackground variant="hero" particles={false} />
                  <div className="absolute inset-0 cf-grid-bg opacity-30" />
                  <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/5 blur-[90px]" />
                  
                  {/* Top Bar info inside Canvas */}
                  <div className="relative z-10 flex justify-between items-center text-white">
                    <Badge tone="flow" className="border-gold-500/30">
                      <Atom className="h-4 w-4 mr-2" /> {selectedConcept || "Overview Blueprint"}
                    </Badge>
                    {regenAttempt > 1 && (
                      <Badge tone="danger" className="text-rose-400 bg-rose-500/10 border-rose-500/20">
                        Attempt {regenAttempt} (Simplified Layout)
                      </Badge>
                    )}
                  </div>

                  {/* Dynamic Scene Renderer (Framer Motion Canvas) */}
                  <div className="relative z-10 flex-1 flex items-center justify-center py-6">
                    <AnimatePresence mode="wait">
                      <SceneRenderer key={sceneIndex} scene={animationScript.scenes[sceneIndex]} />
                    </AnimatePresence>
                  </div>

                  {/* Navigation and Playback Controls */}
                  <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <div className="flex gap-2">
                      {animationScript.scenes.map((s, i) => (
                        <button
                          key={s.id}
                          onClick={() => setSceneIndex(i)}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            i === sceneIndex ? "w-8 bg-gold-500 shadow-lg" : "w-2 bg-white/20 hover:bg-white/40"
                          )}
                          aria-label={`Go to scene ${i + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-white">
                      <span className="text-xs text-silver-400 font-medium">
                        Scene {sceneIndex + 1} of {animationScript.total_scenes}
                      </span>
                      
                      <div className="flex gap-1.5">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setSceneIndex(i => Math.max(0, i - 1))}
                          disabled={sceneIndex === 0}
                          className="bg-white/5 border-white/10 hover:bg-white/10 h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setSceneIndex(i => Math.min(animationScript.scenes.length - 1, i + 1))}
                          disabled={sceneIndex === animationScript.scenes.length - 1}
                          className="bg-white/5 border-white/10 hover:bg-white/10 h-8 w-8"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Socratic RAG Active Recall Panel */}
                {sceneIndex === animationScript.scenes.length - 1 && selectedConcept && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl border border-gold-500/20 bg-gold-500/5 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-gold-500" /> Active Recall Evaluation
                      </h4>
                      <p className="text-sm text-silver-600 dark:text-silver-400 mt-1">
                        Do you feel you fully grasp the mechanisms and structures shown in this animation?
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Button onClick={() => handleUnderstand(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white border-none px-6">
                        Yes, continue
                      </Button>
                      <Button variant="secondary" onClick={() => handleUnderstand(false)} className="bg-white/5 hover:bg-white/10 border-white/10">
                        No, simplify it
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="relative min-h-[550px] rounded-3xl border border-silver-300 bg-abyss-950 flex flex-col items-center justify-center p-8 text-center shadow-2xl dark:border-abyss-700/60">
                <AmbientBackground variant="hero" particles={true} />
                <div className="absolute inset-0 cf-grid-bg opacity-20" />
                <div className="relative z-10 max-w-md flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-gold-500/15 flex items-center justify-center mb-6">
                    <Play className="h-6 w-6 text-gold-400 ml-1 animate-bounce" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">Interactive Visual Stage</h3>
                  <p className="text-silver-400 text-sm mb-6">
                    Select a concept from the directory or trigger the document overview to draw custom Framer Motion shapes on canvas.
                  </p>
                  {concepts.length > 0 && (
                    <Button onClick={playIntroOverview} className="bg-gold-500 hover:bg-gold-400 text-abyss-900 border-none shadow-lg">
                      Start Mapping Blueprint
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simplification & Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-silver-300 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-abyss-800"
            >
              <h3 className="font-display text-lg font-bold mb-2">How can we clarify?</h3>
              <p className="text-sm text-silver-500 mb-4">
                Tell us what was confusing (e.g. "Explain the formula symbols" or "What does water split into?"). Gemini will adapt the animation with simpler analogies.
              </p>
              
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="e.g. The chloroplast diagram was too complex, show it step by step..."
                className="w-full h-32 rounded-xl border border-silver-300 p-3 text-sm focus:border-gold-500 focus:outline-none dark:border-white/10 dark:bg-abyss-900 dark:text-white mb-4"
              />

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowFeedbackModal(false)} disabled={submittingFeedback}>
                  Cancel
                </Button>
                <Button onClick={submitSimplification} loading={submittingFeedback} className="bg-gold-500 text-abyss-900 hover:bg-gold-400 border-none">
                  Simplify Animation
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

// ── Scene Renderer (Canvas Painter) ───────────────────────────────────

function SceneRenderer({ scene }: { scene: Scene }) {
  
  // Custom renders for different Scene types
  switch (scene.type) {
    
    case "concept_intro":
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-center text-white px-6 max-w-xl"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="inline-block p-4 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6"
          >
            <Atom className="h-10 w-10 text-gold-500" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gold-200 to-gold-500">
            {scene.heading || "Concept Exploration"}
          </h2>
          <p className="text-silver-300 text-base md:text-lg leading-relaxed font-medium">
            {scene.subheading || "Let's map out the mechanisms and variables in this topic."}
          </p>
        </motion.div>
      );
      
    case "definition":
      return (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-lg p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white shadow-2xl relative"
        >
          <div className="absolute -top-3 left-6 bg-gold-500 text-abyss-950 font-bold text-xs uppercase px-3.5 py-1 rounded-full">
            Definition
          </div>
          <h3 className="font-display text-2xl font-bold mb-4 text-gold-400 tracking-tight mt-1">
            {scene.term}
          </h3>
          <p className="text-silver-300 text-base md:text-lg leading-relaxed">
            {scene.meaning}
          </p>
        </motion.div>
      );
      
    case "bullet_reveal":
      return (
        <div className="w-full max-w-lg text-white space-y-4 px-4">
          {scene.heading && (
            <h3 className="font-display text-xl font-bold text-gold-400 border-b border-white/10 pb-2 mb-4">
              {scene.heading}
            </h3>
          )}
          <div className="space-y-3">
            {scene.points?.map((pt, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5"
              >
                <div className="h-5 w-5 shrink-0 rounded-full bg-gold-500/20 flex items-center justify-center mt-0.5">
                  <Check className="h-3.5 w-3.5 text-gold-400" />
                </div>
                <p className="text-sm md:text-base text-silver-300 font-medium">{pt}</p>
              </motion.div>
            ))}
          </div>
        </div>
      );
      
    case "flow_diagram":
      return (
        <div className="w-full max-w-2xl text-white px-4">
          {scene.heading && (
            <h3 className="font-display text-lg font-bold text-gold-400 text-center mb-6">
              {scene.heading}
            </h3>
          )}
          <div className="flex flex-col md:flex-row md:items-center justify-center gap-4">
            {scene.steps?.map((step, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center gap-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.2 }}
                  className="bg-gradient-to-br from-gold-500/10 to-gold-600/5 border border-gold-500/25 p-4 rounded-xl text-center shadow-lg min-w-[120px] max-w-[180px]"
                >
                  <span className="text-xs font-mono font-bold text-gold-500 block mb-1">Step {idx + 1}</span>
                  <span className="text-sm font-semibold text-white block">{step}</span>
                </motion.div>
                
                {idx < (scene.steps?.length ?? 0) - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.2 + 0.1 }}
                    className="flex justify-center"
                  >
                    <ArrowRight className="h-5 w-5 text-gold-500/50 rotate-90 md:rotate-0" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
      
    case "comparison":
      return (
        <div className="w-full max-w-2xl text-white px-4">
          {scene.heading && (
            <h3 className="font-display text-lg font-bold text-gold-400 text-center mb-6">
              {scene.heading}
            </h3>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Left side */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h4 className="font-bold text-gold-400 border-b border-white/15 pb-2 mb-3">
                {scene.left?.label}
              </h4>
              <ul className="space-y-2">
                {scene.left?.points.map((p, i) => (
                  <li key={i} className="text-sm text-silver-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right side */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h4 className="font-bold text-emerald-400 border-b border-white/15 pb-2 mb-3">
                {scene.right?.label}
              </h4>
              <ul className="space-y-2">
                {scene.right?.points.map((p, i) => (
                  <li key={i} className="text-sm text-silver-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      );
      
    case "equation":
      return (
        <div className="w-full max-w-lg text-white text-center px-4">
          {scene.heading && (
            <h3 className="font-display text-lg font-bold text-gold-400 mb-8">
              {scene.heading}
            </h3>
          )}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl">
            <Sigma className="h-8 w-8 text-gold-500 mr-2" />
            {scene.elements?.map((el, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", delay: i * 0.1 }}
                className={cn(
                  "px-3 py-2 rounded-lg font-mono text-xl font-extrabold shadow-lg",
                  ["+", "-", "*", "/", "=", "→"].includes(el)
                    ? "text-gold-500 font-bold bg-transparent"
                    : "bg-gold-500 text-abyss-950"
                )}
              >
                {el}
              </motion.div>
            ))}
          </div>
        </div>
      );
      
    case "timeline":
      return (
        <div className="w-full max-w-xl text-white px-4">
          {scene.heading && (
            <h3 className="font-display text-lg font-bold text-gold-400 text-center mb-6">
              {scene.heading}
            </h3>
          )}
          <div className="relative border-l border-gold-500/30 ml-4 space-y-6 py-2">
            {scene.events?.map((ev, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="relative pl-6"
              >
                <div className="absolute -left-[6px] top-1.5 h-3 w-3 rounded-full bg-gold-500 shadow-md ring-4 ring-gold-500/10" />
                <h4 className="font-bold text-sm text-gold-400 font-display">{ev.label}</h4>
                <p className="text-xs text-silver-300 mt-1 leading-relaxed">{ev.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      );
      
    case "summary":
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative"
        >
          <div className="absolute -top-3 left-6 bg-emerald-500 text-abyss-950 font-bold text-xs uppercase px-3 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Summary
          </div>
          <h3 className="font-display text-xl font-bold mb-4 text-emerald-400 tracking-tight mt-1">
            {scene.heading || "Key Takeaways"}
          </h3>
          <ul className="space-y-3">
            {scene.points?.map((pt, idx) => (
              <li key={idx} className="text-sm text-silver-300 flex items-start gap-2.5">
                <div className="h-4 w-4 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5 text-emerald-400">
                  ✓
                </div>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      );

    default:
      return (
        <div className="text-white text-center">
          <p>Analyzing scene structure...</p>
        </div>
      );
  }
}
