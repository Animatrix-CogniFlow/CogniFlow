import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Loader2, GraduationCap, Baby, BookOpen, Compass } from "lucide-react";

import UniDashboard from "./personas/UniDashboard";
import KidsDashboard from "./personas/KidsDashboard";
import SecondaryDashboard from "./personas/SecondaryDashboard";
import CasualDashboard from "./personas/CasualDashboard";

const API = import.meta.env.VITE_API_URL as string;

export default function AdaptiveDashboard() {
  const [persona, setPersona] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    async function checkUserPersona() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().persona) {
          setPersona(userDoc.data().persona);
        } else {
          setPersona(null);
        }
      } catch (err) {
        console.error("Error fetching persona:", err);
      } finally {
        setLoading(false);
      }
    }

    const unsubscribe = auth.onAuthStateChanged(() => {
      checkUserPersona();
    });
    return () => unsubscribe();
  }, [auth, db]);

  async function handleSelectPersona(selectedPersona: string) {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      // 1. Save to Firestore users collection for fast local reads
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { persona: selectedPersona });

      // 2. Also tell the backend so every agent uses the right persona
      const token = await user.getIdToken();
      await fetch(`${API}/api/profile/persona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ persona: selectedPersona }),
      });

      setPersona(selectedPersona);
    } catch (err) {
      console.error("Error saving persona:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-abyss-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        <p className="mt-4 font-display text-sm tracking-wide text-silver-400">
          Syncing your personalized learning space...
        </p>
      </div>
    );
  }

  if (!persona) {
    return <OnboardingPersonaSelection onSelect={handleSelectPersona} />;
  }

  switch (persona) {
    case "university":
      return <UniDashboard onChangePersona={() => setPersona(null)} />;
    case "kid":
      return <KidsDashboard onChangePersona={() => setPersona(null)} />;
    case "secondary":
      return <SecondaryDashboard onChangePersona={() => setPersona(null)} />;
    case "casual":
      return <CasualDashboard onChangePersona={() => setPersona(null)} />;
    default:
      return <UniDashboard onChangePersona={() => setPersona(null)} />;
  }
}

function OnboardingPersonaSelection({ onSelect }: { onSelect: (p: string) => void }) {
  const options = [
    {
      id: "university",
      title: "University / Research",
      desc: "Deep academic content, technical depth, precise terminology.",
      icon: GraduationCap,
      color: "hover:border-blue-500/50",
    },
    {
      id: "kid",
      title: "Kids / Primary School",
      desc: "Fun, bright, playful and encouraging.",
      icon: Baby,
      color: "hover:border-pink-500/50",
    },
    {
      id: "secondary",
      title: "High School Student",
      desc: "Clear structure, exam focused, relatable.",
      icon: BookOpen,
      color: "hover:border-emerald-500/50",
    },
    {
      id: "casual",
      title: "Casual / Adult Learner",
      desc: "Relaxed, practical, real world focused.",
      icon: Compass,
      color: "hover:border-gold-500/50",
    },
  ];

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-abyss-950 px-6 py-12 text-white relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-[120px]" />

      <div className="relative z-10 max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold tracking-tight"
        >
          Who are you?
        </motion.h1>
        <p className="mt-2 text-silver-400 text-sm">
          CogniFlow adapts everything — animations, explanations, quizzes and feedback — based on who you are.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 text-left">
          {options.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(opt.id)}
                className={`p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all text-left flex gap-4 items-start ${opt.color}`}
              >
                <div className="rounded-xl bg-white/5 p-3 text-gold-500">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">{opt.title}</h3>
                  <p className="text-xs text-silver-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
