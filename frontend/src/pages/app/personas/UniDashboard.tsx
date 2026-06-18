import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Terminal, Cpu, Database, Settings } from "lucide-react";

export default function UniDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  return (
    <PageContainer>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Academic Knowledge Terminal</h1>
          <p className="text-sm text-silver-500">Deep neural vector embeddings for structured material parsing.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onChangePersona} className="text-xs border-white/10 text-silver-400">
          <Settings className="h-3 w-3 mr-1.5" /> Change Persona
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-white/[0.06] bg-abyss-900/60 backdrop-blur-md">
          <CardBody className="p-6 text-white">
            <div className="flex items-center gap-2 text-gold-500 mb-4">
              <Cpu className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-widest font-bold">Vector Ingestion Active</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Connected Repositories</h2>
            <p className="text-sm text-silver-400 leading-relaxed">
              Your active models are processing your textbook data into discrete mathematical vectors. Click on any module to enter the advanced visual testing suite.
            </p>
          </CardBody>
        </Card>

        <Card className="border-white/[0.06] bg-abyss-900/40">
          <CardBody className="p-6 text-white font-mono text-xs text-silver-400 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Terminal className="h-4 w-4" />
              <span>SYSTEM LOGS</span>
            </div>
            <p>&gt; initializing socratic rag pipeline...</p>
            <p>&gt; cross-examination matrix calibrated</p>
            <p className="text-emerald-400">&gt; tokens refreshed successfully</p>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
