import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useChatStore } from "../../../stores/useChatStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { BookOpen, Target, Plus, Play, Sparkles, HelpCircle, GraduationCap, Settings } from "lucide-react";

export default function SecondaryDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const documentsLoading = useChatStore((s) => s.documentsLoading);
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? "Student";
  const latestDoc = documents.length > 0 ? documents[0] : null;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-silver-200 pb-5 dark:border-white/10">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Academic Study Suite
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-abyss-950 dark:text-white mt-1">
            Welcome back, {userName}!
          </h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onChangePersona} 
          className="border-silver-300 dark:border-white/10 text-silver-600 dark:text-silver-400"
        >
          <Settings className="h-4 w-4 mr-1.5" /> Change Persona
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ACTIVE SYLLABUS TRACKER */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-silver-505 uppercase tracking-wider text-silver-500">
            My Course Work
          </h3>

          {documentsLoading ? (
            <Card>
              <CardBody className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <span className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-sm text-silver-500 font-medium">Fetching syllabus decks...</span>
              </CardBody>
            </Card>
          ) : latestDoc ? (
            /* ACTIVE MATERIAL CARD */
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-abyss-900 border border-silver-200 dark:border-white/[0.05] p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[220px]"
            >
              <div className="flex gap-4 items-start">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3.5 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-block text-[10px] uppercase font-extrabold tracking-wider bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full mb-2">
                    Active Study Syllabus
                  </span>
                  <h4 className="font-display font-bold text-xl text-abyss-950 dark:text-white leading-tight">
                    {latestDoc.title}
                  </h4>
                  <p className="text-xs text-silver-500 mt-1 font-semibold uppercase tracking-wider">
                    Subject: {latestDoc.subject}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-silver-100 dark:border-white/5 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-silver-100 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "80%" }} />
                  </div>
                  <span className="text-xs font-bold text-silver-600 dark:text-silver-400 font-mono">
                    80% Reviewed
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate("/app/lab")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white border-none font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/15"
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Study Deck
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/app/upload")}
                    className="border-silver-300 dark:border-white/10 text-silver-700 dark:text-silver-300 text-xs px-5 py-2.5"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Upload File
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ONBOARDING FLOW CARD */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-dashed border-silver-300 dark:border-white/10 bg-transparent">
                <CardBody className="p-8">
                  <div className="max-w-md mx-auto text-center flex flex-col items-center">
                    <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5 text-emerald-500">
                      <GraduationCap className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-abyss-950 dark:text-white">Get Ready to Ace Your Exams!</h3>
                    <p className="text-xs text-silver-600 dark:text-silver-400 mb-6 leading-relaxed font-medium">
                      CogniFlow converts your textbooks and syllabus study sheets into active learning toolkits. Follow this checklist to begin:
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-bold text-xs flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                        <Plus className="h-3.5 w-3.5" /> 1. Upload Class Material
                      </h4>
                      <p className="text-[11px] text-silver-500 leading-relaxed font-medium">
                        Upload slides, manuals, or textbooks to extract custom concept modules.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-bold text-xs flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                        <BookOpen className="h-3.5 w-3.5" /> 2. Check the Visual Lab
                      </h4>
                      <p className="text-[11px] text-silver-500 leading-relaxed font-medium">
                        See formulas, timeline diagrams, and compare key ideas side-by-side.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-bold text-xs flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-3.5 w-3.5" /> 3. Socratic Active Tutor
                      </h4>
                      <p className="text-[11px] text-silver-500 leading-relaxed font-medium">
                        Tap the chat bubble at the bottom right to review and ask the tutor questions.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-bold text-xs flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                        <HelpCircle className="h-3.5 w-3.5" /> 4. Play Graded Quizzes
                      </h4>
                      <p className="text-[11px] text-silver-500 leading-relaxed font-medium">
                        Prepare for exams with active recall quizzes and customized flashcards.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button onClick={() => navigate("/app/upload")} className="bg-emerald-600 hover:bg-emerald-500 text-white border-none font-bold px-6">
                      <Plus className="h-4 w-4 mr-2" /> Upload Your Study File
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>

        {/* STUDY GOALS SIDEBAR */}
        <div className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardBody className="p-6">
              <h3 className="font-display font-bold text-lg text-abyss-950 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500 animate-pulse" /> Exam Countdown
              </h3>
              <p className="text-xs text-silver-500 mt-1">Targeting high score revisions.</p>
              
              <div className="mt-4 space-y-3">
                <div className="bg-white dark:bg-abyss-950 p-3 rounded-xl border border-silver-200 dark:border-white/5 flex justify-between items-center">
                  <span className="text-xs font-semibold text-silver-600">Term Exams Prep</span>
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
