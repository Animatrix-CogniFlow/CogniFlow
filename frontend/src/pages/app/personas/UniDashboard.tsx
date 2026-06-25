import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useChatStore } from "../../../stores/useChatStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Terminal, Cpu, Database, Settings, Play, Plus, BookOpen, Sparkles, GraduationCap } from "lucide-react";

export default function UniDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const documentsLoading = useChatStore((s) => s.documentsLoading);
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? "Researcher";
  const latestDoc = documents.length > 0 ? documents[0] : null;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <PageContainer>
      {/* Top Header Section */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4 border-b border-silver-200 pb-5 dark:border-white/10">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Academic Domain
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-silver-900 dark:text-white mt-1">
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-silver-600 dark:text-silver-400 mt-1">
            Academic Knowledge Terminal active.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onChangePersona}
          className="text-xs border-silver-300 dark:border-white/10 text-silver-600 dark:text-silver-400 hover:bg-silver-100 dark:hover:bg-white/5"
        >
          <Settings className="h-3 w-3 mr-1.5" /> Change Persona
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {documentsLoading ? (
            <Card>
              <CardBody className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <LoaderSpinner />
                <span className="text-sm text-silver-500 font-mono">Querying local vector database...</span>
              </CardBody>
            </Card>
          ) : latestDoc ? (
            /* LAST USED DOCUMENT VIEW */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-gold-500/20 bg-gradient-to-br from-white via-silver-50 to-white dark:from-abyss-900 dark:via-abyss-950 dark:to-abyss-900">
                <CardBody className="p-8 text-silver-900 dark:text-white">
                  <div className="flex items-center gap-2 text-gold-700 dark:text-gold-500 mb-4">
                    <Cpu className="h-5 w-5 animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Active Research Corpus</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2 text-silver-900 dark:text-white">
                    {latestDoc.title}
                  </h2>
                  <p className="text-xs text-silver-500 font-mono uppercase tracking-wider mb-6">
                    Subject: {latestDoc.subject}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-silver-200 dark:border-white/10 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-28 bg-silver-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-500" style={{ width: "65%" }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-silver-600 dark:text-silver-400">
                        65% Parsed
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate("/app/lab")}
                        className="bg-gold-500 hover:bg-gold-400 text-abyss-950 border-none font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-gold-500/10"
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Study in Lab
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/app/upload")}
                        className="border-silver-300 dark:border-white/10 text-silver-700 dark:text-silver-300 text-xs px-5 py-2.5"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> New Material
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ) : (
            /* NEW USER ONBOARDING GUIDE */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-dashed border-silver-300 dark:border-white/10 bg-transparent">
                <CardBody className="p-8">
                  <div className="max-w-md mx-auto text-center flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-gold-500/10 flex items-center justify-center mb-6">
                      <GraduationCap className="h-8 w-8 text-gold-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Welcome to CogniFlow, Academic!</h3>
                    <p className="text-sm text-silver-600 dark:text-silver-400 mb-8 leading-relaxed">
                      CogniFlow utilizes agentic Socratic Retrieval-Augmented Generation to stress-test your comprehension of research papers and textbooks. Here is how to begin:
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 mt-4 text-left">
                    <div className="p-5 rounded-2xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-gold-600 dark:text-gold-400">
                        <Plus className="h-4 w-4" /> 1. Ingest Materials
                      </h4>
                      <p className="text-xs text-silver-600 dark:text-silver-400 leading-relaxed">
                        Go to the Upload page and submit a textbook or research PDF. Our models will extract key concepts and build your vector base.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-gold-600 dark:text-gold-400">
                        <BookOpen className="h-4 w-4" /> 2. Visual Studio
                      </h4>
                      <p className="text-xs text-silver-600 dark:text-silver-400 leading-relaxed">
                        Visit the Visual Lab to view automatically generated interactive flowcharts, mathematical formulas, and definitions.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-gold-600 dark:text-gold-400">
                        <Sparkles className="h-4 w-4" /> 3. Socratic Tutor
                      </h4>
                      <p className="text-xs text-silver-600 dark:text-silver-400 leading-relaxed">
                        Engage with the Socratic AI Chat bubble on the bottom right. It won't just summarize; it will actively probe your understanding.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-silver-50 dark:bg-white/[0.01] border border-silver-100 dark:border-white/5">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-gold-600 dark:text-gold-400">
                        <Terminal className="h-4 w-4" /> 4. Oral Exams
                      </h4>
                      <p className="text-xs text-silver-600 dark:text-silver-400 leading-relaxed">
                        Test your memory by answering verbally under the Oral Exam module, getting feedback on conceptual accuracy.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button onClick={() => navigate("/app/upload")} className="bg-gold-500 hover:bg-gold-400 text-abyss-950 font-bold border-none px-6">
                      <Plus className="h-4 w-4 mr-2" /> Upload Your First Material
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Side Panel Section */}
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6 font-mono text-xs text-silver-600 dark:text-silver-400 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <Terminal className="h-4 w-4" />
                <span>SYSTEM LOGS</span>
              </div>
              <p>&gt; initializing socratic RAG pipeline...</p>
              <p>&gt; cross-examination matrix active</p>
              {latestDoc && <p className="text-gold-600 dark:text-gold-400">&gt; indexed: {latestDoc.title.substring(0, 15)}...</p>}
              <p className="text-emerald-600 dark:text-emerald-400">&gt; tokens refreshed successfully</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function LoaderSpinner() {
  return (
    <span className="h-6 w-6 rounded-full border-2 border-gold-500 border-t-transparent animate-spin inline-block" />
  );
}
