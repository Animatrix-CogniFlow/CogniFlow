import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, MessagesSquare, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/brand/Logo";
import { OrchestrationOrb } from "../../components/visuals/OrchestrationOrb";

const STEPS = [
  {
    icon: Upload,
    title: "Upload anything",
    body: "Drop in notes, PDFs, or slides. CogniFlow parses and understands them instantly.",
  },
  {
    icon: Sparkles,
    title: "Become visual intelligence",
    body: "Autonomous agents transform static material into cinematic, interactive explanations.",
  },
  {
    icon: MessagesSquare,
    title: "Learn, speak, master",
    body: "Chat with an AI tutor, practice oral exams, and receive real-time feedback.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const item = STEPS[step];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-abyss-950 p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 cf-grid-bg opacity-30" />
      <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-gold-500/20 blur-3xl" />

      <div className="relative w-full max-w-lg text-center z-10">
        <div className="mb-8 flex justify-center">
          <Logo size={40} />
        </div>

        <motion.div
          key="carousel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          <OrchestrationOrb className="mx-auto mb-8 max-w-[220px]" />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/15 text-gold-600">
                <item.icon className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
                {item.title}
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-silver-600">{item.body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-8 bg-gold-500" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button variant="ghost" className="text-silver-600" onClick={() => navigate("/app")}>
              Skip
            </Button>
            <Button
              onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : navigate("/app"))}
            >
              {step < STEPS.length - 1 ? "Next" : "Enter CogniFlow"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
