import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { useChatStore } from "../../../stores/useChatStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Sparkles, Trophy, Flame, Star, Rocket, Play, Plus, BookOpen, MessageSquare, Gamepad2 } from "lucide-react";

export default function KidsDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const documentsLoading = useChatStore((s) => s.documentsLoading);
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? "Explorer";
  const latestDoc = documents.length > 0 ? documents[0] : null;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 to-orange-100 p-8 text-abyss-900 font-sans selection:bg-pink-200">
      
      {/* Playful Top Nav */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border-2 border-amber-200">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-pink-500 to-orange-500 text-white p-2.5 rounded-2xl shadow-md">
            <Rocket className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-600 tracking-tight">
              CogniAdventure!
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
            <Flame className="h-4 w-4 fill-white animate-pulse" /> Welcome, {userName}!
          </div>
          <button onClick={onChangePersona} className="text-xs font-bold text-silver-600 hover:text-pink-600 transition-colors">
            Switch View
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        
        <div className="md:col-span-2 space-y-6">
          {documentsLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-md border-4 border-amber-200 flex flex-col items-center justify-center gap-4">
              <span className="h-10 w-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
              <span className="font-black text-lg text-pink-600">Loading your adventure maps...</span>
            </div>
          ) : latestDoc ? (
            /* ACTIVE MISSION CARD */
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-3xl p-8 shadow-md border-4 border-b-8 border-pink-400 flex flex-col justify-between min-h-[280px]"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                  <Sparkles className="h-3 w-3" /> Active Space Mission
                </div>
                <h2 className="text-3xl font-black tracking-tight text-abyss-950 leading-tight">
                  Let's explore: {latestDoc.title}!
                </h2>
                <p className="text-silver-600 mt-2 text-base font-medium">
                  Subject: {latestDoc.subject}
                </p>
              </div>

              {/* Progress and Actions */}
              <div className="mt-8 border-t border-silver-100 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-silver-100 h-3 rounded-full overflow-hidden border border-silver-200">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-orange-500" style={{ width: "70%" }} />
                  </div>
                  <span className="text-xs font-bold text-silver-600">70% Explored</span>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={() => navigate("/app/lab")}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 border-none text-white font-black py-4 rounded-xl shadow-md transform transition active:translate-y-0.5"
                  >
                    <Play className="h-4 w-4 mr-1.5 fill-current" /> Go! 🚀
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/app/upload")}
                    className="flex-1 border-2 border-pink-200 text-pink-600 hover:bg-pink-50 font-black py-4 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> New Map
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* NEW USER WELCOME / ONBOARDING MAT */
            <motion.div 
              className="bg-white rounded-3xl p-8 shadow-md border-4 border-b-8 border-pink-400"
            >
              <div className="text-center flex flex-col items-center max-w-lg mx-auto">
                <div className="h-16 w-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Rocket className="h-8 w-8 animate-bounce" />
                </div>
                <h2 className="text-2xl font-black text-abyss-950">Welcome to CogniAdventure!</h2>
                <p className="text-silver-600 mt-2 text-sm font-medium">
                  We turn boring school books into interactive games and visual stories. Here is how you can play:
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-8">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="font-black text-sm text-pink-600 flex items-center gap-1.5 mb-1.5">
                    <Plus className="h-4 w-4" /> 1. Upload a Book
                  </span>
                  <p className="text-xs text-silver-600 leading-relaxed font-medium">
                    Ask a parent or teacher to upload a homework file or study guide.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="font-black text-sm text-pink-600 flex items-center gap-1.5 mb-1.5">
                    <BookOpen className="h-4 w-4" /> 2. Watch Animation
                  </span>
                  <p className="text-xs text-silver-600 leading-relaxed font-medium">
                    Head to the Visual Lab and watch the leaf parts or molecules move around!
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="font-black text-sm text-pink-600 flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="h-4 w-4" /> 3. Chat with Captain AI
                  </span>
                  <p className="text-xs text-silver-600 leading-relaxed font-medium">
                    Click the robot bubble on the bottom right and ask it any question!
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="font-black text-sm text-pink-600 flex items-center gap-1.5 mb-1.5">
                    <Gamepad2 className="h-4 w-4" /> 4. Play Quizzes
                  </span>
                  <p className="text-xs text-silver-600 leading-relaxed font-medium">
                    Take super fun quizzes, test your knowledge, and earn cool medals!
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button 
                  onClick={() => navigate("/app/upload")}
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-black text-lg py-5 px-8 rounded-2xl border-none shadow-lg shadow-pink-500/20"
                >
                  Start Your First Mission! 🚀
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* REWARDS BLOCK */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-4 border-b-8 border-yellow-400 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="font-display font-black text-xl text-yellow-600 flex items-center gap-2">
              <Trophy className="h-5 w-5 fill-yellow-100 animate-spin" style={{ animationDuration: '6s' }} /> My Space Badges
            </h3>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[1, 2, 3].map((b) => (
                <div key={b} className="aspect-square bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-2xl flex items-center justify-center text-yellow-500 hover:scale-110 transition-transform cursor-pointer">
                  <Star className="h-6 w-6 fill-yellow-400" />
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs font-bold text-silver-600 text-center mt-4">Gain 50XP more to unlock the next space badge!</p>
        </div>

      </div>
    </div>
  );
}
