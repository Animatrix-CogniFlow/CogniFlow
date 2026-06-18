import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Atom, Maximize2, Sigma, ArrowRight } from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AmbientBackground } from "../../components/visuals/AmbientBackground";
import { cn } from "../../lib/utils";

// ==========================================
// 1. BACKEND DATA CONTRACTS (TYPESCRIPT)
// ==========================================
type VisualMode = "intro" | "concept";

interface IntroAnimation {
  mode: "intro";
  title: string;
  hook: string;
  scenes: Array<{ id: string; text: string }>;
}

interface ConceptAnimation {
  mode: "concept";
  conceptName: string;
  subject: string;
  steps: Array<{
    id: number;
    title: string;
    description: string;
    formulaPlain?: string;
    elements: Array<{
      id: string;
      label: string;
      color: string;
      initialX: number;
      initialY: number;
      animateX: number;
      animateY: number;
    }>;
  }>;
}

type BackendVisualPayload = IntroAnimation | ConceptAnimation;

// ==========================================
// 2. MOCK BACKEND DATA (FOR TESTING)
// ==========================================
const MOCK_INTRO_PAYLOAD: IntroAnimation = {
  mode: "intro",
  title: "Applied Geophysics",
  hook: "Unlock the secrets hidden beneath the Earth's surface.",
  scenes: [
    { id: "s1", text: "Every day, thousands of miles of earth are scanned to find hidden resources." },
    { id: "s2", text: "But how do we see what we cannot dig? We use the principles of absolute physics." },
    { id: "s3", text: "Welcome to Applied Geophysics. Let's break down the core concepts." },
  ],
};

const MOCK_CONCEPT_PAYLOAD: ConceptAnimation = {
  mode: "concept",
  conceptName: "Photosynthesis",
  subject: "Biology",
  steps: [
    {
      id: 1,
      title: "1. Light Absorption",
      description: "Photons from sunlight strike the chloroplasts in the plant cell, exciting electrons to higher energy states.",
      formulaPlain: "Energy = hν",
      elements: [
        { id: "sun", label: "☀️ Sunlight", color: "bg-amber-500", initialX: 0, initialY: -120, animateX: 0, animateY: -40 },
        { id: "leaf", label: "🌿 Chloroplast", color: "bg-emerald-500", initialX: 0, initialY: 100, animateX: 0, animateY: 40 },
      ],
    },
    {
      id: 2,
      title: "2. Water Splitting (Photolysis)",
      description: "The excited energy splits water molecules into Oxygen, Protons, and Electrons.",
      formulaPlain: "2H₂O → 4H⁺ + 4e⁻ + O₂",
      elements: [
        { id: "water", label: "💧 H2O Molecule", color: "bg-blue-500", initialX: -150, initialY: 40, animateX: -20, animateY: 40 },
        { id: "oxygen", label: "💨 O2 (Released)", color: "bg-silver-200 text-abyss-900", initialX: -20, initialY: 40, animateX: 150, animateY: -60 },
      ],
    },
    {
      id: 3,
      title: "3. Energy Production",
      description: "The movement of electrons down the transport chain generates ATP chemical energy.",
      formulaPlain: "ADP + Pi + Energy → ATP",
      elements: [
        { id: "leaf", label: "🌿 Chloroplast", color: "bg-emerald-500", initialX: 0, initialY: 40, animateX: 0, animateY: 40 },
        { id: "atp", label: "⚡ ATP Generated!", color: "bg-gold-500 text-abyss-900", initialX: 0, initialY: 40, animateX: 0, animateY: -100 },
      ],
    },
  ],
};

// ==========================================
// 3. MAIN ROUTER COMPONENT
// ==========================================
export default function VisualLab() {
  // Currently using Mock Data. Once the API is wired, you will set this via aiService.
  const [payload, setPayload] = useState<BackendVisualPayload>(MOCK_INTRO_PAYLOAD);

  return (
    <PageContainer wide>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Visual Learning Lab</h1>
          <p className="mt-1 text-silver-600 dark:text-silver-600">
            Cinematic STEM visualizations rendered from your material.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* DEV TOOL: Remove this before final presentation! */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPayload(payload.mode === "intro" ? MOCK_CONCEPT_PAYLOAD : MOCK_INTRO_PAYLOAD)}
            className="border-gold-500/50 text-gold-600"
          >
            Switch to: {payload.mode === "intro" ? "Concept Mode" : "Intro Mode"}
          </Button>

          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4" /> Fullscreen
          </Button>
        </div>
      </div>

      {/* DYNAMIC ROUTING STAGE */}
      {payload.mode === "intro" ? (
        <IntroductoryStage data={payload} onComplete={() => setPayload(MOCK_CONCEPT_PAYLOAD)} />
      ) : (
        <InteractiveConceptStage data={payload} />
      )}
    </PageContainer>
  );
}

// ==========================================
// 4. INTRODUCTORY STAGE (Cinematic Trailer)
// ==========================================
function IntroductoryStage({ data, onComplete }: { data: IntroAnimation; onComplete: () => void }) {
  const [index, setIndex] = useState(0);

  // Auto-advance narrative every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (index < data.scenes.length - 1) {
        setIndex((i) => i + 1);
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [index, data.scenes.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-silver-300 bg-abyss-950 min-h-[550px] flex flex-col items-center justify-center p-8 text-center dark:border-abyss-700/60 shadow-2xl">
      <AmbientBackground variant="hero" particles={true} />
      <div className="absolute inset-0 cf-grid-bg opacity-30" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-[100px]" />

      <div className="relative z-10 max-w-3xl text-white flex flex-col items-center">
        <Badge tone="flow" className="mb-6 px-4 py-1.5 text-sm border-gold-500/30">
          <Atom className="h-4 w-4 mr-2" /> {data.hook}
        </Badge>
        
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-display text-5xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600"
        >
          {data.title}
        </motion.h2>

        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-2xl md:text-3xl text-silver-300 leading-relaxed font-medium"
            >
              {data.scenes[index].text}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Button
        className="absolute bottom-8 right-8 z-20 bg-white text-abyss-900 hover:bg-silver-200 transition-all hover:scale-105"
        onClick={onComplete}
      >
        Start Concepts <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

// ==========================================
// 5. INTERACTIVE CONCEPT STAGE (Active Recall)
// ==========================================
function InteractiveConceptStage({ data }: { data: ConceptAnimation }) {
  const [index, setIndex] = useState(0);
  const step = data.steps[index];

  const next = useCallback(() => {
    if (index < data.steps.length - 1) setIndex((i) => i + 1);
  }, [index, data.steps.length]);

  const prev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-silver-300 bg-silver-900 dark:bg-abyss-950 dark:border-abyss-700/60 shadow-xl">
      <AmbientBackground variant="hero" particles={false} />
      <div className="absolute inset-0 cf-grid-bg opacity-30" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[80px]" />

      <div className="relative grid min-h-[500px] gap-8 p-8 lg:grid-cols-2 lg:p-12">
        
        {/* THE VISUAL STAGE (Left Side) */}
        <div className="relative flex items-center justify-center min-h-[350px] rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md overflow-hidden">
          <AnimatePresence mode="popLayout">
            {step.elements.map((el) => (
              <motion.div
                key={el.id}
                initial={{ opacity: 0, x: el.initialX, y: el.initialY, scale: 0.8 }}
                animate={{ opacity: 1, x: el.animateX, y: el.animateY, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className={cn(
                  "absolute px-6 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center justify-center border border-white/20 whitespace-nowrap",
                  el.color
                )}
              >
                {el.label}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* NARRATIVE & ACTIVE RECALL (Right Side) */}
        <div className="flex flex-col justify-center text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <Badge tone="flow" className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <Atom className="h-3 w-3 mr-1.5" /> {data.subject}
              </Badge>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white leading-tight">
                {step.title}
              </h2>
              <p className="mt-4 text-lg text-silver-300 leading-relaxed">
                {step.description}
              </p>

              {step.formulaPlain && (
                <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner">
                  <Sigma className="h-5 w-5 text-gold-500" />
                  <code className="font-mono text-lg text-gold-400 font-bold">{step.formulaPlain}</code>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Socratic RAG Active Recall Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 border-t border-white/10 pt-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-3">
              Did you understand this mechanism?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={next}
                disabled={index === data.steps.length - 1}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Yes, continue
              </Button>
              <Button variant="secondary" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-silver-300">
                No, simplify it
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* TIMELINE CONTROLS (Bottom) */}
      <div className="relative flex items-center justify-between border-t border-white/10 px-8 py-5 bg-black/30 backdrop-blur-sm">
        <div className="flex gap-2.5">
          {data.steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 ease-out",
                i === index ? "w-10 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "w-2 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-silver-400 font-medium">
            Step {index + 1} of {data.steps.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={prev}
              disabled={index === 0}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={next}
              disabled={index === data.steps.length - 1}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
