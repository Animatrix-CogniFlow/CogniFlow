import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Compass, Clock, Zap, BarChart3, Settings, Play } from "lucide-react";

export default function CasualDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  return (
    <PageContainer>
      {/* High-End Minimalist Header */}
      <div className="mb-8 flex items-center justify-between border-b border-silver-200 dark:border-white/[0.08] pb-6">
        <div>
          <h1 className="font-display text-2xl font-light tracking-wide text-silver-900 dark:text-white">
            Performance Console
          </h1>
          <p className="text-xs text-silver-600 dark:text-silver-400 mt-1 font-mono uppercase tracking-widest">Continuous Upskilling Node</p>
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

          {/* ACTIVE SKILL STREAM */}
          <Card className="bg-gradient-to-br from-white via-silver-50 to-white dark:from-abyss-900 dark:via-abyss-950 dark:to-abyss-900">
            <CardBody className="p-8 text-silver-900 dark:text-white">
              <span className="text-[10px] font-mono tracking-widest text-gold-700 dark:text-gold-500 uppercase font-black bg-gold-100 dark:bg-gold-500/10 px-2 py-0.5 rounded">Active Focus</span>
              <h2 className="text-2xl font-semibold tracking-tight mt-3 text-silver-900 dark:text-white">Strategic Corporate Finance</h2>
              <p className="text-sm text-silver-600 dark:text-silver-400 mt-2 max-w-xl leading-relaxed">
                Vectorizing core modules on portfolio diversification matrices and cash-flow valuations. Jump straight back into the oral cross-examiner.
              </p>
              
              <div className="mt-6 flex gap-3">
                <Button className="bg-gold-600 hover:bg-gold-700 text-white dark:bg-white dark:text-abyss-950 dark:hover:bg-silver-200 text-xs font-bold px-6 border-none">
                  <Play className="h-3.5 w-3.5 mr-2 fill-current" /> Resume Stream
                </Button>
              </div>
            </CardBody>
          </Card>
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
