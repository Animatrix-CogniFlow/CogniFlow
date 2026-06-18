import { Link } from "react-router-dom";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  Layers,
  ListChecks,
  Sparkles,
  Mic,
  Network,
  MessagesSquare,
  Quote,
  Globe,
  Send,
  AtSign,
  Moon,
  Sun,
  Brain,
  Users,
  Clock,
  Zap,
} from "lucide-react";
import { Logo } from "../components/brand/Logo";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { OrchestrationOrb } from "../components/visuals/OrchestrationOrb";
import { AmbientBackground } from "../components/visuals/AmbientBackground";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { Counter } from "../components/ui/Counter";
import { FadeIn, StaggerGroup, StaggerItem } from "../components/ui/Motion";
import { useTheme } from "../hooks/useTheme";

const FEATURES = [
  { icon: Sparkles, title: "Visual Learning Lab", body: "Cinematic, fullscreen animations that turn abstract concepts into interactive scenes.", tone: "from-cyan-500 to-blue-600" },
  { icon: Mic, title: "Oral Examination", body: "Practice speaking with an AI examiner. Get analysis on your understanding of the concepts and constructive feedback.", tone: "from-emerald-500 to-teal-600" },
  { icon: Layers, title: "Smart Flashcards", body: "Paste notes and instantly get flashcards with a built-in spaced-repetition scheduler that adapts to your recall.", tone: "from-gold-400 to-gold-600" },
  { icon: ListChecks, title: "Graded Quizzes", body: "Multiple-choice quizzes generated from your material, graded instantly with explanations and score history.", tone: "from-amber-500 to-orange-600" },
  { icon: MessagesSquare, title: "AI Tutor", body: "A streaming conversational tutor that adapts to how you learn.", tone: "from-violet-500 to-violet-700" },
  { icon: Network, title: "Multi-Agent Orchestration", body: "Watch autonomous agents collaborate in real time.", tone: "from-rose-500 to-pink-600" },
];

const STEPS = [
  { n: "01", title: "Paste your notes", body: "Drop in notes, definitions, or a passage." },
  { n: "02", title: "AI generates material", body: "Animated Videos,Flashcards & quizzes built from your concepts." },
  { n: "03", title: "Review with SRS", body: "Spaced repetition schedules every card for recall." },
  { n: "04", title: "Test & master", body: "Take graded quizzes, interact with live tutors and track your progress." },
];

const TESTIMONIALS = [
  { name: "Dr. Elara Voss", role: "Professor, Neuroscience", body: "CogniFlow turns my dense lecture notes into visual stories my students actually remember." },
  { name: "Marcus Lin", role: "Med Student", body: "The oral exam mode is unreal — it's like rehearsing with a calm, brilliant examiner." },
  { name: "Aisha Rahman", role: "Self-learner", body: "Watching the agents collaborate makes learning feel alive. It's the most premium study tool I've used." },
];

const STATS = [
  { icon: Brain, to: 24, suffix: "+", label: "Concepts visualized", decimals: 0, fmt: "24" },
  { icon: Users, to: 5, suffix: "+", label: "Active learners" },
  { icon: Clock, to: 92, suffix: "%", label: "Recall improvement" },
  { icon: Zap, to: 7, suffix: "", label: "Autonomous agents" },
];

const MARQUEE = ["Physics", "Biology", "Calculus", "Chemistry", "Anatomy", "Engineering", "Economics", "Neuroscience", "Organic Chemistry", "History", "Literature", "Mathematics"];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const orbScale = useTransform(heroScroll, [0, 1], [1, 1.2]);
  const orbRotate = useTransform(heroScroll, [0, 1], [0, 30]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-silver-100 text-silver-900 dark:bg-abyss-950 dark:text-cobalt-100">
      {/* Scroll progress */}
      <motion.div
        className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-gradient-to-r from-gold-400 via-gold-500 to-amber-400 dark:from-cobalt-400 dark:via-cobalt-500 dark:to-violet-500"
        style={{ scaleX: progress }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-silver-200/70 bg-silver-100/80 backdrop-blur-xl dark:border-abyss-700/60 dark:bg-abyss-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-silver-500 dark:text-cobalt-400/70 md:flex">
            <a href="#features" className="transition-colors hover:text-silver-900 dark:hover:text-cobalt-100">Features</a>
            <a href="#how" className="transition-colors hover:text-silver-900 dark:hover:text-cobalt-100">How it works</a>
            <a href="#voices" className="transition-colors hover:text-silver-900 dark:hover:text-cobalt-100">Voices</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-silver-200 dark:hover:bg-white/5"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/signin" className="hidden sm:block">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative">
        <AmbientBackground variant="hero" />
        <div className="absolute inset-0 cf-grid-bg opacity-40" />
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge tone="flow" className="mb-5">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-gold-500"
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  Ready to make learning fun?
                </Badge>
              </motion.div>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Turn static notes into{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-gold-400 via-violet-500 to-gold-600 bg-[length:200%_auto] bg-clip-text text-transparent [animation:cf-shimmer-text_4s_linear_infinite]">
                    animated, cinematic content.
                  </span>
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-silver-500 dark:text-cobalt-400/70">
                CogniFlow is an interactive, automated learning companion —
                tutors, visual labs, oral exams, and several agents in one
                platform to make you the next Einstein.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button size="lg">
                    Start learning <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button size="lg" variant="outline">
                    Explore the demo
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-silver-400">
                No stressful setup required — just paste your notes and start learning.
              </p>
            </motion.div>
          </div>

          <motion.div
            style={{ scale: orbScale, rotate: orbRotate }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="flex justify-center"
          >
            <OrchestrationOrb />
          </motion.div>
        </motion.div>

        {/* Marquee */}
        <div className="relative border-y border-silver-200/60 bg-white/40 py-4 backdrop-blur dark:border-abyss-700/60 dark:bg-abyss-900/30">
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
              className="flex shrink-0 items-center gap-10 pr-10"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            >
              {[...MARQUEE, ...MARQUEE].map((m, i) => (
                <span key={i} className="flex items-center gap-3 text-sm font-medium text-silver-400">
                  <span className="h-1 w-1 rounded-full bg-gold-400 dark:bg-cobalt-400" /> {m}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem key={s.label}>
                <SpotlightCard className="p-6 text-center" tilt={false}>
                  <s.icon className="mx-auto mb-3 h-6 w-6 text-gold-500 dark:text-cobalt-400" />
                  <p className="font-display text-3xl font-semibold tracking-tight">
                    {s.fmt ? s.fmt : <Counter to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />}
                  </p>
                  <p className="mt-1 text-sm text-silver-500 dark:text-cobalt-400/70">{s.label}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Transformation strip */}
      <section className="relative border-y border-silver-200/60 bg-silver-100/60 py-16 dark:border-abyss-700/60 dark:bg-abyss-900/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeIn className="mb-10 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              From notes to an animated ecosystem
            </h2>
            <p className="mt-2 text-silver-500 dark:text-cobalt-400/70">A visualized experience.</p>
          </FadeIn>
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.n}>
                <motion.div whileHover={{ y: -6 }}>
                  <SpotlightCard className="h-full p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl font-semibold text-gold-500 dark:text-cobalt-400/70">{s.n}</span>
                      {i < STEPS.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-slate-300 dark:text-white/20" />
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-silver-500 dark:text-cobalt-400/70">{s.body}</p>
                  </SpotlightCard>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 lg:py-28">
        <AmbientBackground particles={false} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeIn className="mb-12 max-w-2xl">
            <Badge tone="flow" className="mb-4">One interactive environment</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The setup you need to learn, all in one place
            </h2>
            <p className="mt-3 text-silver-500 dark:text-cobalt-400/70">
              With CogniFlow, academic torture is not an option. Just paste your notes, watch them come alive, and interact with them in the ways you learn best.
            </p>
          </FadeIn>
          <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <SpotlightCard className="h-full p-6">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.08 }}
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.tone} text-white shadow-lg`}
                  >
                    <f.icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-silver-500 dark:text-cobalt-400/70">{f.body}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative overflow-hidden border-y border-silver-200/60 bg-silver-900 py-24 text-white dark:bg-abyss-900/40">
        <AmbientBackground variant="hero" particles={false} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <FadeIn>
            <Badge tone="flow" className="mb-4">Cinematic by design</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Watch intelligence work
            </h2>
            <p className="mt-3 max-w-md text-silver-400">
              Animated visuals, Live Tutor, Oral Examiner, Editor and Feedback agents hand
              off tasks in real time.
            </p>
            <Link to="/signup" className="mt-7 inline-block">
              <Button size="lg">Experience it <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </FadeIn>
          <FadeIn delay={0.15} className="flex justify-center">
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <OrchestrationOrb className="max-w-sm" />
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section id="voices" className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeIn className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Voices from the flow
            </h2>
          </FadeIn>
          <StaggerGroup className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <motion.div whileHover={{ y: -6 }}>
                  <SpotlightCard className="h-full p-6">
                    <Quote className="h-6 w-6 text-cobalt-400" />
                    <p className="mt-4 text-sm leading-relaxed text-silver-600 dark:text-cobalt-200">"{t.body}"</p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-xs font-semibold text-white">
                        {t.name.slice(0, 1)}
                      </span>
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-silver-400">{t.role}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-5 pb-24 sm:px-8">
        <FadeIn className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-gold-600 to-gold-800 dark:from-cobalt-700 dark:to-abyss-800 p-10 text-center text-white sm:p-16">
            <AmbientBackground variant="stage" />
            <div className="absolute inset-0 cf-grid-bg opacity-20" />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to make learning fun?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-gold-100 dark:text-cobalt-100">
                Join CogniFlow and turn everything you study into an animated experience.
              </p>
              <Link to="/signup" className="mt-8 inline-block">
                <Button size="lg" variant="secondary">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-silver-200/60 py-12 dark:border-abyss-700/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 sm:px-8 md:flex-row">
          <Logo />
          <p className="text-sm text-silver-400">© 2026 CogniFlow. Visual intelligence for learning.</p>
          <div className="flex gap-4 text-silver-400">
            <a href="#" aria-label="Updates" className="transition-colors hover:text-gold-500 dark:text-cobalt-400"><Send className="h-5 w-5" /></a>
            <a href="#" aria-label="Website" className="transition-colors hover:text-gold-500 dark:text-cobalt-400"><Globe className="h-5 w-5" /></a>
            <a href="#" aria-label="Contact" className="transition-colors hover:text-gold-500 dark:text-cobalt-400"><AtSign className="h-5 w-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
