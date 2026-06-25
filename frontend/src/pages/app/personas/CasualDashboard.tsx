import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useChatStore } from "../../../stores/useChatStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Compass, Clock, Zap, BarChart3, Settings, Play, Plus, BookOpen, Sparkles, Award } from "lucide-react";

export default function CasualDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const documentsLoading = useChatStore((s) => s.documentsLoading);
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? "Learner";
  const latestDoc = documents.length > 0 ? documents[0] : null;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <PageContainer>
      {/* High-End Minimalist Header */}
      <div className="mb-8 flex items-center justify-between border-b border-silver-200 dark:border-white/[0.08] pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-gold-600 dark:text-gold-500 uppercase font-black bg-gold-100 dark:bg-gold-500/10 px-2 py-0.5 rounded">
            Continuous Learning Node
          </span>
          <h1 className="font-display text-2xl font-light tracking-wide text-silver-900 dark:text-white mt-2">
            Welcome back, {userName}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={onChangePersona} className="border-silver-300 dark:border-white/10 text-silver-600 dark:text-silver-400 font-normal hover:bg-silver-100 dark:hover:bg-white/5">
          <Settings className="h-3.5 w-3.5 mr-2" /> Shift Domain
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* AGENT PERFORMANCE METRICS */}
        <div className="md:col-span-3 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard icon={Clock} value="4.2 hrs" label="Time Spent Testing" color="text-blue-600 dark:text-cobalt-400" />
            <MetricCard icon={Zap} value="18" label="Concepts Mastered" color="text-gold-600 dark:text-gold-500" />
            <MetricCard icon={BarChart3} value="88%" label="Socratic Accuracy" color="text-emerald-600 dark:text-emerald-400" />
          </div>

          {documentsLoading ? (
            <Card>
              <CardBody className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <span className="h-8 w-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
                <span className="text-sm text-silver-500 font-mono">Syncing active skill decks...</span>
              </CardBody>
            </Card>
          ) : latestDoc ? (
            /* ACTIVE FOCUS BLOCK */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-white via-silver-50 to-white dark:from-abyss-900 dark:via-abyss-950 dark:to-abyss-900">
                <CardBody className="p-8 text-silver-900 dark:text-white">
                  <span className="text-[10px] font-mono tracking-widest text-gold-700 dark:text-gold-500 uppercase font-black bg-gold-100 dark:bg-gold-500/10 px-2 py-0.5 rounded">Active Skill Deck</span>
                  <h2 className="text-2xl font-semibold tracking-tight mt-3 text-silver-900 dark:text-white">
                    {latestDoc.title}
                  </h2>
                  <p className="text-xs text-silver-500 font-mono mt-1 uppercase tracking-wider">
                    Domain: {latestDoc.subject}
                  </p>

                  <div className="mt-8 border-t border-silver-200 dark:border-white/10 pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-28 bg-silver-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-600 dark:bg-gold-500" style={{ width: "55%" }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-silver-600 dark:text-silver-400">
                        55% Complete
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => navigate("/app/lab")}
                        className="bg-gold-600 hover:bg-gold-700 text-white dark:bg-white dark:text-abyss-950 dark:hover:bg-silver-200 text-xs font-bold px-6 border-none rounded-xl"
                      >
                        <Play className="h-3.5 w-3.5 mr-2 fill-current" /> Resume Stream
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/app/upload")}
                        className="border-silver-300 dark:border-white/10 text-silver-700 dark:text-silver-300 text-xs px-5 py-2.5"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Ingest New
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ) : (
            /* ADULT ONBOARDING WIDGET */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-dashed border-silver-300 dark:border-white/10 bg-transparent">
                <CardBody className="p-8">
                  <div className="max-w-md mx-auto text-center flex flex-col items-center">
                    <div className="h-14 w-14 rounded-full bg-gold-500/10 flex items-center justify-center mb-5 text-gold-600 dark:text-gold-500">
                      <Compass className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Welcome to Your Mastery Console</h3>
                    <p className="text-xs text-silver-600 dark:text-silver-400 mb-6 leading-relaxed font-medium">
                      CogniFlow optimizes professional upskilling through context-pinned active recall. Follow these simple steps to build your study pipeline:
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-semibold text-xs flex items-center gap-1.5 mb-1 text-gold-600 dark:text-gold-500">
                        <Plus className="h-3.5 w-3.5" /> 1. Upload Material
                      </h4>
                      <p className="text-[11px] text-silver-500 leading-relaxed font-medium">
                        Upload industrial manuals, technical documents, or textbooks in the Upload section.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-semibold text-xs flex items-center gap-1.5 mb-1 text-gold-600 dark:text-gold-500">
                        <BookOpen className="h-3.5 w-3.5" /> 2. Examine Flowcharts
                      </h4>
                      <p className="text-[11px] text-silver-500 leading-relaxed font-medium">
                        Enter the Visual Lab to dissect formulas, timeline events, and side-by-side matrices.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-semibold text-xs flex items-center gap-1.5 mb-1 text-gold-600 dark:text-gold-500">
                        <Sparkles className="h-3.5 w-3.5" /> 3. Conversational AI Tutor
                      </h4>
                      <p className="text-[11px] text-silver-500 leading-relaxed font-medium">
                        Click the Socratic AI Chat icon at the bottom right to query and cross-examine concepts.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-semibold text-xs flex items-center gap-1.5 mb-1 text-gold-600 dark:text-gold-500">
                        <Award className="h-3.5 w-3.5" /> 4. Socratic Quiz Review
                      </h4>
                      <p className="text-[11px] text-silver-500 leading-relaxed font-medium">
                        Build and take quizzes directly derived from your corpus to lock in knowledge.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button onClick={() => navigate("/app/upload")} className="bg-gold-600 hover:bg-gold-700 dark:bg-white dark:text-abyss-950 dark:hover:bg-silver-200 border-none font-bold px-6">
                      <Plus className="h-4 w-4 mr-2" /> Upload Your Document
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>

        {/* SIDE ARCHIVE TRACKS */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-mono tracking-wider text-silver-600 dark:text-silver-400 uppercase font-bold">Parallel Skill Paths</h4>
          
          {["Data Architecting", "Applied ML Frameworks"].map((track) => (
            <div key={track} className="p-4 rounded-xl border border-silver-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.01] hover:bg-silver-50 dark:hover:bg-white/[0.03] transition-colors flex justify-between items-center group cursor-pointer">
              <span className="text-sm font-medium text-silver-800 dark:text-silver-300 group-hover:text-silver-900 group-hover:dark:text-white transition-colors">{track}</span>
              <Compass className="h-4 w-4 text-silver-400 dark:text-silver-600 group-hover:text-gold-600 dark:group-hover:text-gold-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

function MetricCard({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-silver-200 bg-white dark:border-white/[0.05] dark:bg-abyss-900/40 p-5 flex items-center gap-4">
      <div className={`rounded-xl bg-silver-100 dark:bg-white/5 p-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-silver-900 dark:text-white font-mono">{value}</p>
        <p className="text-xs font-medium text-silver-600 dark:text-silver-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
