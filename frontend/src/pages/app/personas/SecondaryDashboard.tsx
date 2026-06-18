import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { BookOpen, Target, Calendar, Award, Settings } from "lucide-react";

export default function SecondaryDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const subjects = [
    { name: "Mathematics", topics: "Calculus, Trigonometry", progress: 75, color: "bg-emerald-500" },
    { name: "Chemistry", topics: "Organic Compounds, Gas Laws", progress: 40, color: "bg-teal-500" },
    { name: "English Literature", topics: "Prose Analysis, Shakespeare", progress: 90, color: "bg-cyan-500" },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-silver-200 pb-5 dark:border-white/10">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Academic Study Suite</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-abyss-950 dark:text-white mt-1">
            Syllabus Mastery Board
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={onChangePersona} className="border-silver-300 dark:border-white/10 text-silver-600 dark:text-silver-400">
          <Settings className="h-4 w-4 mr-1.5" /> Change Persona
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ACTIVE SYLLABUS TRACKER */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-silver-500 uppercase tracking-wider">My Course Work</h3>
          
          {subjects.map((sub, i) => (
            <motion.div
              key={sub.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-abyss-900 border border-silver-200 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex gap-4 items-center">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-abyss-950 dark:text-white">{sub.name}</h4>
                  <p className="text-xs text-silver-500 mt-0.5">{sub.topics}</p>
                </div>
              </div>
              
              <div className="w-full sm:w-48 flex items-center gap-3">
                <div className="w-full bg-silver-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color}`} style={{ width: `${sub.progress}%` }} />
                </div>
                <span className="text-xs font-bold text-silver-600 font-mono w-8">{sub.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* STUDY GOALS SIDEBAR */}
        <div className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardBody className="p-6">
              <h3 className="font-display font-bold text-lg text-abyss-950 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" /> Exam Countdown
              </h3>
              <p className="text-xs text-silver-500 mt-1">Targeting high score revisions.</p>
              
              <div className="mt-4 space-y-3">
                <div className="bg-white dark:bg-abyss-950 p-3 rounded-xl border border-silver-200 dark:border-white/5 flex justify-between items-center">
                  <span className="text-xs font-semibold text-silver-600">JAMB Prep Revision</span>
                  <span className="text-xs bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full">14 Days Left</span>
                </div>
                <div className="bg-white dark:bg-abyss-950 p-3 rounded-xl border border-silver-200 dark:border-white/5 flex justify-between items-center">
                  <span className="text-xs font-semibold text-silver-600">Mock Evaluation Test</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">Completed</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
