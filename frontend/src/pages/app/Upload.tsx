import { useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  Sparkles,
  Brain,
  Video,
  ArrowRight,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { contentService, type UploadResult } from "../../services/contentService";
import { formatBytes, cn } from "../../lib/utils";

const PIPELINE = ["Uploading", "Parse document", "Extract concepts", "Generate study material"];

export default function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean, focused state
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  
  // Processing state
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

  function handleFileSelection(file: File) {
    setError("");
    
    // Validate file type (PDF only)
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      setSelectedFile(null);
      return;
    }

    // Validate file size (Max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File is too large. Maximum allowed size is 50MB. Your file is ${Math.round(file.size / (1024 * 1024) * 10) / 10}MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    // Auto-fill the title from the file name, removing the extension
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  }

  async function generate() {
    if (!selectedFile) return;
    
    setProcessing(true);
    setResult(null);
    setError("");
    setStage(PIPELINE[0]);
    setProgress(0);

    try {
      const generator = contentService.uploadDocument(selectedFile, "en");
      let finalResult: UploadResult | null = null;
      
      // We use a while loop here to capture the final 'return' value of the generator,
      // while updating the UI with the 'yield' progress events.
      while (true) {
        const current = await generator.next();
        if (current.done) {
          finalResult = current.value as UploadResult;
          break;
        }
        setStage(current.value.stage);
        setProgress(current.value.progress);
      }

      setResult(finalResult);
      setProgress(100);
      setStage("Done");
    } catch (err: any) {
      setError(err.message || "Failed to upload document. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  function resetAll() {
    setSelectedFile(null);
    setTitle("");
    setSubject("");
    setResult(null);
    setProgress(0);
    setStage("");
    setError("");
  }

  return (
    <PageContainer>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight text-abyss-900 dark:text-white">
          Initialize Knowledge Base
        </h1>
        <p className="mt-2 text-silver-600 dark:text-silver-400">
          Upload your PDF, slides, or notes. The CogniFlow AI engine will parse the document, extract core concepts, and build your interactive environment.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          
          {/* MASSIVE DROPZONE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={!processing ? { scale: 1.01 } : {}}
            onDragOver={(e) => {
              e.preventDefault();
              if (!processing) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={processing ? undefined : onDrop}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center transition-all duration-300",
              dragging ? "border-gold-400 bg-gold-500/10 dark:bg-gold-500/20" : "border-silver-300 bg-white/50 dark:border-white/10 dark:bg-abyss-800/40",
              processing && "opacity-60 cursor-not-allowed",
              selectedFile && !dragging && "border-emerald-400/50 bg-emerald-500/5 dark:bg-emerald-500/10"
            )}
          >
            <motion.div
              animate={{ y: dragging ? -8 : 0 }}
              className={cn(
                "mb-5 flex h-20 w-20 items-center justify-center rounded-2xl transition-colors",
                selectedFile ? "bg-emerald-500/20 text-emerald-600" : "bg-gold-500/20 text-gold-600"
              )}
            >
              {selectedFile ? <FileText className="h-10 w-10" /> : <UploadCloud className="h-10 w-10" />}
            </motion.div>
            
            <h3 className="font-display text-xl font-semibold tracking-tight">
              {selectedFile ? "File Ready for Processing" : "Drag & Drop your document here"}
            </h3>
            <p className="mt-2 text-sm text-silver-600 dark:text-silver-400">
              Supports PDF (Max 50MB)
            </p>
            
            <Button 
              className="mt-6 shadow-lg shadow-gold-500/20" 
              onClick={() => inputRef.current?.click()}
              disabled={processing}
            >
              {selectedFile ? "Change File" : "Browse files"}
            </Button>
            
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
            />

            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 flex items-center gap-3 rounded-full border border-silver-300 bg-white px-5 py-2 shadow-sm dark:border-white/10 dark:bg-abyss-900"
              >
                <span className="text-sm font-medium text-abyss-900 dark:text-white truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-silver-500 font-mono">
                  {formatBytes(selectedFile.size)}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* METADATA INPUTS */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input 
              label="Document Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Applied Geophysics Chap 1" 
              disabled={processing}
            />
            <Input 
              label="Subject / Category" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g. Earth Sciences" 
              disabled={processing}
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 font-medium">
              {error}
            </motion.p>
          )}

          <div className="flex items-center justify-between border-t border-silver-200 pt-6 dark:border-white/10">
            <Button variant="ghost" onClick={resetAll} disabled={processing || !selectedFile}>
              Clear
            </Button>
            <Button 
              onClick={generate} 
              loading={processing} 
              disabled={!selectedFile || !title.trim()}
              className="bg-abyss-900 text-white hover:bg-abyss-800 dark:bg-gold-500 dark:text-abyss-900 dark:hover:bg-gold-400"
            >
              <Brain className="h-4 w-4 mr-2" /> 
              {processing ? stage || "Analyzing..." : "Initialize AI Engines"}
            </Button>
          </div>

          {/* SUCCESS RESULT */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SpotlightCard className="p-6 border-emerald-500/30 bg-emerald-500/5" tilt={false}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-tight">Intelligence Extracted</h3>
                      <p className="text-sm text-silver-600 dark:text-silver-400">
                        {result.title} has been successfully parsed by the backend.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Stat icon={Brain} label="Key Concepts Mapped" value={result.total_concepts} />
                    <Stat icon={FileText} label="Language Detected" valueText={result.language_code.toUpperCase()} />
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-emerald-500/20 pt-6">
                    <Button onClick={() => navigate(`/app/visual-lab/${result.document_id}`)} className="bg-emerald-600 hover:bg-emerald-500 text-white border-none">
                      <Video className="h-4 w-4 mr-2" /> Enter Visual Lab
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/app/study/${result.document_id}`)}>
                      <ArrowRight className="h-4 w-4 mr-2" /> Continue to Dashboard
                    </Button>
                  </div>
                </SpotlightCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PIPELINE SIDEBAR */}
        <div>
          <Card className="sticky top-6">
            <CardBody>
              <h3 className="mb-5 font-display text-lg font-semibold tracking-tight">AI Processing Status</h3>
              <div className="space-y-3">
                {PIPELINE.map((p, i) => {
                  const activeIdx = PIPELINE.indexOf(stage);
                  const status =
                    result || (!processing && progress === 100)
                      ? "done"
                      : processing && activeIdx === i
                      ? "active"
                      : processing && activeIdx > i
                      ? "done"
                      : "idle";
                  
                  return (
                    <motion.div 
                      key={p} 
                      className="flex items-center gap-4 py-1"
                      animate={{ opacity: status === "idle" ? 0.5 : 1 }}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-500",
                          status === "done" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : status === "active" ? "bg-gold-500 text-abyss-900 shadow-lg shadow-gold-500/20"
                            : "bg-silver-200 text-silver-500 dark:bg-white/5"
                        )}
                      >
                        {status === "done" ? <CheckCircle2 className="h-5 w-5" />
                          : status === "active" ? <Loader2 className="h-4 w-4 animate-spin" />
                          : i + 1}
                      </span>
                      <span className={cn("text-sm transition-all duration-300", status === "active" ? "font-semibold text-abyss-900 dark:text-white" : "font-medium text-silver-600")}>
                        {p}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {processing && (
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-silver-200 dark:bg-white/10 shadow-inner">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              )}

              <div className="mt-8 rounded-xl bg-silver-100 p-4 dark:bg-white/5 border border-silver-200 dark:border-white/10">
                <Badge tone="flow" className="mb-3 border-gold-500/30">Backend Architecture</Badge>
                <p className="text-xs leading-relaxed text-silver-600 dark:text-silver-400">
                  Documents are securely transmitted to the FastAPI server, chunked, and embedded using Gemini Pro. Once vectorized, they unlock interactive animations, voice exams, and customized flashcards.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Stat({ icon: Icon, label, value, valueText }: { icon: typeof Brain; label: string; value?: number; valueText?: string; }) {
  return (
    <div className="rounded-xl border border-silver-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 flex items-start gap-4">
      <div className="rounded-lg bg-silver-100 p-2 dark:bg-white/10">
        <Icon className="h-5 w-5 text-abyss-900 dark:text-gold-400" />
      </div>
      <div>
        <p className="font-display text-xl font-bold tracking-tight text-abyss-900 dark:text-white">
          {valueText ?? value}
        </p>
        <p className="text-xs font-medium text-silver-500 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}
