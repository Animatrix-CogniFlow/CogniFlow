import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, MessagesSquare, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/brand/Logo";
import { OrchestrationOrb } from "../../components/visuals/OrchestrationOrb";

// Firebase imports
import { auth, db } from "../../config/firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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
  const [showRegistration, setShowRegistration] = useState(false); // Controls the flip from carousel to form
  
  // Firebase Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [persona, setPersona] = useState<"kid" | "secondary" | "casual" | "university">("university");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const item = STEPS[step];

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create the base login in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save the Persona to the Firestore Database
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        persona: persona,
        createdAt: new Date().toISOString()
      });

      console.log("Account created and persona saved perfectly!");
      navigate("/"); // Change this to your actual dashboard route 

    } catch (error: any) {
      console.error("Registration failed:", error.message);
      alert(error.message); // Temporarily show error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-abyss-950 p-6">
      {/* Background Effects stay exactly as you designed them */}
      <div className="absolute inset-0 cf-grid-bg opacity-30" />
      <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-gold-500/20 blur-3xl" />

      <div className="relative w-full max-w-lg text-center z-10">
        <div className="mb-8 flex justify-center">
          <Logo size={40} />
        </div>

        <AnimatePresence mode="wait">
          {!showRegistration ? (
            /* --- PART 1: THE CAROUSEL UI --- */
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
                <Button variant="ghost" className="text-silver-600" onClick={() => setShowRegistration(true)}>
                  Skip
                </Button>
                <Button
                  onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : setShowRegistration(true))}
                >
                  {step < STEPS.length - 1 ? "Next" : "Enter CogniFlow"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            /* --- PART 2: THE REGISTRATION FORM --- */
            <motion.div
              key="registration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-abyss-900/80 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl text-left"
            >
              <h2 className="text-3xl font-display font-bold mb-6 text-center text-white">Create Profile</h2>
              
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-silver-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-abyss-950 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-400 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-abyss-950 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none transition-colors"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-silver-400 mb-1">Learning Profile</label>
                  <select 
                    value={persona}
                    onChange={(e) => setPersona(e.target.value as any)}
                    className="w-full bg-abyss-950 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 outline-none appearance-none cursor-pointer transition-colors"
                  >
                    <option value="kid">Young Learner (Kid)</option>
                    <option value="secondary">Exam Prep (Secondary)</option>
                    <option value="university">Deep Research (University)</option>
                    <option value="casual">Lifelong Learner (Casual)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-1/3 text-silver-600 border border-white/10"
                    onClick={() => setShowRegistration(false)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-2/3 bg-gold-600 hover:bg-gold-500 text-white font-bold"
                  >
                    {isLoading ? "Creating..." : "Start Learning"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
