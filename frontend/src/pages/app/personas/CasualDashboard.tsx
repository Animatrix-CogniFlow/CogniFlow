import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Compass, Clock, Zap, BarChart3, Settings, Play } from "lucide-react";

export default function CasualDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  return (
    <PageContainer>
      {/* High-End Minimalist Header */}
      <div className="mb-8 flex items-center justify-between border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="font-display text-2xl font-light tracking-wide text-white">
            Performance Console
          </h1>
          <p className="text-xs text-silver-500 mt-1 font-mono uppercase tracking-widest">Continuous Upskilling Node</p>
        </div>
        <Button variant="outline" size="sm" onClick={onChangePersona} className="border-white/10 text-silver-400 font-normal hover:bg-white/5">
          <Settings className="h-3.5 w-3.5 mr-2" /> Shift Domain
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* AGENT PERFORMANCE METRICS */}
        <div className="md:col-span-3 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard icon={Clock} value="4.2 hrs" label="Time Spent Testing" color="text-cobalt-400" />
            <MetricCard icon={Zap} value="18" label="Concepts Mastered" color="text-gold-500" />
            <MetricCard icon={BarChart3} value="88%" label="Socratic Accuracy" color="text-emerald-400" />
          </div>

          {/* ACTIVE SKILL STREAM */}
          <Card className="border-white/[0.04] bg-gradient-to-br from-abyss-900 via-abyss-950 to-abyss-900">
            <CardBody className="p-8 text-white">
              <span className="text-[10px] font-mono tracking-widest text-gold-500 uppercase font-black bg-gold-500/10 px-2 py-0.5 rounded">Active Focus</span>
              <h2 className="text-2xl font-semibold tracking-tight mt-3">Strategic Corporate Finance</h2>
              <p className="text-sm text-silver-400 mt-2 max-w-xl leading-relaxed">
                Vectorizing core modules on portfolio diversification matrices and cash-flow valuations. Jump straight back into the oral cross-examiner.
              </p>
              
              <div className="mt-6 flex gap-3">
                <Button className="bg-white text-abyss-950 hover:bg-silver-200 text-xs font-bold px-6 border-none">
                  <Play className="h-3.5 w-3.5 mr-2 fill-current" /> Resume Stream
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* SIDE ARCHIVE TRACKS */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-mono tracking-wider text-silver-500 uppercase font-bold">Parallel Skill Paths</h4>
          
          {["Data Architecting", "Applied ML Frameworks"].map((track) => (
            <div key={track} className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex justify-between items-center group cursor-pointer">
              <span className="text-sm font-medium text-silver-300 group-hover:text-white transition-colors">{track}</span>
              <Compass className="h-4 w-4 text-silver-600 group-hover:text-gold-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

function MetricCard({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-abyss-900/40 p-5 flex items-center gap-4">
      <div className={`rounded-xl bg-white/5 p-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-white font-mono">{value}</p>
        <p className="text-xs font-medium text-silver-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
