import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { Sparkles, Trophy, Flame, Star, Rocket } from "lucide-react";

export default function KidsDashboard({ onChangePersona }: { onChangePersona: () => void }) {
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
            <Flame className="h-4 w-4 fill-white" /> 3 Day Streak!
          </div>
          <button onClick={onChangePersona} className="text-xs font-bold text-silver-600 hover:text-pink-600 transition-colors">
            Switch View
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        
        {/* BIG HERO WELCOME BUTTON */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-2 bg-white rounded-3xl p-8 shadow-md border-4 border-b-8 border-pink-400 flex flex-col justify-between min-h-[250px]"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles className="h-3 w-3" /> Mission of the Day
            </div>
            <h2 className="text-3xl font-black tracking-tight text-abyss-950 leading-tight">
              Let's explore the world of Photosynthesis!
            </h2>
            <p className="text-silver-600 mt-2 text-base font-medium max-w-md">
              Plants eat sunlight to create energy superpowers. Climb inside the leaf and see how they do it!
            </p>
          </div>
          
          <Button className="mt-6 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 border-none text-white font-black text-lg py-6 rounded-2xl shadow-lg shadow-pink-500/20 transform transition active:translate-y-1">
            Launch Simulation! 🚀
          </Button>
        </motion.div>

        {/* REWARDS BLOCK */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-4 border-b-8 border-yellow-400 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-black text-xl text-yellow-600 flex items-center gap-2">
              <Trophy className="h-5 w-5 fill-yellow-100" /> My Badges
            </h3>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[1, 2, 3].map((b) => (
                <div key={b} className="aspect-square bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-2xl flex items-center justify-center text-yellow-500">
                  <Star className="h-6 w-6 fill-yellow-400" />
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs font-bold text-silver-500 text-center mt-4">Gain 50XP more to unlock the next space badge!</p>
        </div>

      </div>
    </div>
  );
}
