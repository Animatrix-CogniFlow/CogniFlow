import { useState } from "react";
import { Sun, Moon, Monitor, Zap, Eye, Bell, User as UserIcon, Gauge, Save } from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody, CardHeader, CardTitle } from "../../components/ui/Card";
import { Toggle } from "../../components/ui/Toggle";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { usePreferencesStore } from "../../stores/usePreferencesStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useQuality } from "../../hooks/useQuality";
import { cn } from "../../lib/utils";
import type {
  EducationLevel,
  MotionLevel,
  QualityTier,
  StudyGoal,
  StudyTime,
  ThemeMode,
  User,
} from "../../lib/types";

// ── Static option lists ──────────────────────────────────────

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark",  label: "Dark",  icon: Moon },
];

const MOTION_OPTIONS: { value: MotionLevel; label: string }[] = [
  { value: "full",    label: "Full" },
  { value: "reduced", label: "Reduced" },
  { value: "off",     label: "Off" },
];

const QUALITY_OPTIONS: { value: QualityTier; label: string; desc: string }[] = [
  { value: "auto",        label: "Auto",        desc: "Detect device" },
  { value: "cinematic",   label: "Cinematic",   desc: "Max visuals" },
  { value: "balanced",    label: "Balanced",    desc: "Smooth + rich" },
  { value: "performance", label: "Performance", desc: "Fastest" },
];

const GENDER_OPTIONS = [
  { value: "male",               label: "Male" },
  { value: "female",             label: "Female" },
  { value: "non_binary",         label: "Non-binary" },
  { value: "prefer_not_to_say",  label: "Prefer not to say" },
];

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "high_school",    label: "High School" },
  { value: "undergraduate",  label: "Undergraduate" },
  { value: "postgraduate",   label: "Postgraduate" },
  { value: "other",          label: "Other" },
];

const GOAL_OPTIONS: { value: StudyGoal; label: string }[] = [
  { value: "pass_exams",        label: "Pass exams" },
  { value: "learn_skills",      label: "Learn new skills" },
  { value: "research",          label: "Research" },
  { value: "personal_interest", label: "Personal interest" },
];

const STUDY_TIME_OPTIONS: { value: StudyTime; label: string }[] = [
  { value: "morning",   label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening",   label: "Evening" },
  { value: "night",     label: "Night" },
];

const LANGUAGE_OPTIONS = [
  "English", "French", "Arabic", "Spanish", "Portuguese",
  "Swahili", "Hausa", "Yoruba", "Amharic", "Twi", "Other",
];

// ── Component ────────────────────────────────────────────────

export default function Settings() {
  const {
    theme, setTheme,
    motion, setMotion,
    quality, setQuality,
    highContrast, setHighContrast,
    notifications, setNotification,
  } = usePreferencesStore();

  const user       = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const profile    = useQuality();

  // Local form state — initialised from the stored user profile
  const [form, setForm] = useState<Partial<User>>({
    name:             user?.name             ?? "",
    email:            user?.email            ?? "",
    country:          user?.country          ?? "",
    gender:           user?.gender,
    educationLevel:   user?.educationLevel,
    institution:      user?.institution      ?? "",
    fieldOfStudy:     user?.fieldOfStudy     ?? "",
    primaryLanguage:  user?.primaryLanguage  ?? "",
    studyGoal:        user?.studyGoal,
    weeklyStudyHours: user?.weeklyStudyHours ?? 0,
    preferredTime:    user?.preferredTime,
  });

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  function set<K extends keyof User>(key: K, value: User[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveErr(null);
    try {
      await updateUser(form);
      setSaved(true);
    } catch {
      setSaveErr("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-silver-900 dark:text-cobalt-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-silver-600 dark:text-cobalt-400">
          Personalise your CogniFlow environment.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Appearance ──────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-5 w-5 text-gold-600 dark:text-cobalt-400" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-0">
            <div>
              <p className="mb-2 text-sm font-medium text-silver-800 dark:text-cobalt-200">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {THEME_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setTheme(o.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition",
                      theme === o.value
                        ? "border-gold-400 bg-gold-50 text-gold-700 dark:border-cobalt-500 dark:bg-cobalt-500/10 dark:text-cobalt-200"
                        : "border-silver-300 text-silver-600 hover:border-silver-400 dark:border-abyss-600 dark:text-cobalt-400 dark:hover:border-abyss-500"
                    )}
                  >
                    <o.icon className="h-4 w-4" /> {o.label}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Motion ──────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-gold-600 dark:text-cobalt-400" /> Motion
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-0">
            <p className="text-sm text-silver-600 dark:text-cobalt-400">
              Control the intensity of cinematic animation.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MOTION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setMotion(o.value)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-medium transition",
                    motion === o.value
                      ? "border-gold-400 bg-gold-50 text-gold-700 dark:border-cobalt-500 dark:bg-cobalt-500/10 dark:text-cobalt-200"
                      : "border-silver-300 text-silver-600 hover:border-silver-400 dark:border-abyss-600 dark:text-cobalt-400"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* ── Visual quality ──────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-gold-600 dark:text-cobalt-400" /> Visual quality
              </span>
              <Badge tone="gold" className="capitalize">{profile.tier}</Badge>
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-0">
            <p className="text-sm text-silver-600 dark:text-cobalt-400">
              Balance cinematic richness with speed.{" "}
              <strong className="text-silver-800 dark:text-cobalt-200">Auto</strong> detects your
              device — currently rendering in{" "}
              <span className="font-medium text-gold-600 dark:text-cobalt-300">{profile.tier}</span> mode.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUALITY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setQuality(o.value)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-center transition",
                    quality === o.value
                      ? "border-gold-400 bg-gold-50 text-gold-700 dark:border-cobalt-500 dark:bg-cobalt-500/10 dark:text-cobalt-200"
                      : "border-silver-300 text-silver-600 hover:border-silver-400 dark:border-abyss-600 dark:text-cobalt-400"
                  )}
                >
                  <span className="block text-sm font-medium">{o.label}</span>
                  <span className="mt-0.5 block text-[11px] opacity-70">{o.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-silver-600 dark:text-cobalt-400">
              {[
                `Particles: ${profile.particles ? profile.particleCount : "off"}`,
                `Links: ${profile.connections ? "on" : "off"}`,
                `FPS cap: ${profile.fps}`,
                `Spotlight: ${profile.spotlight ? "on" : "off"}`,
              ].map((label) => (
                <span key={label} className="rounded-md bg-silver-200 px-2 py-1 dark:bg-abyss-800">
                  {label}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* ── Accessibility ────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-5 w-5 text-gold-600 dark:text-cobalt-400" /> Accessibility
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-0">
            <SettingsRow label="High contrast" description="Increase contrast for readability">
              <Toggle checked={highContrast} onChange={setHighContrast} label="High contrast" />
            </SettingsRow>
            <SettingsRow label="Screen reader announcements" description="Announce streaming AI responses">
              <Toggle checked onChange={() => {}} label="Screen reader announcements" />
            </SettingsRow>
          </CardBody>
        </Card>

        {/* ── Notifications ────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-gold-600 dark:text-cobalt-400" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4 pt-0">
            <SettingsRow label="Product updates" description="News and new features">
              <Toggle checked={notifications.product} onChange={(v) => setNotification("product", v)} label="Product updates" />
            </SettingsRow>
            <SettingsRow label="Learning reminders" description="Stay on your streak">
              <Toggle checked={notifications.learning} onChange={(v) => setNotification("learning", v)} label="Learning reminders" />
            </SettingsRow>
            <SettingsRow label="Agent activity" description="When agents finish processing">
              <Toggle checked={notifications.agents} onChange={(v) => setNotification("agents", v)} label="Agent activity" />
            </SettingsRow>
          </CardBody>
        </Card>

        {/* ── Account ─────────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-5 w-5 text-gold-600 dark:text-cobalt-400" /> Account
            </CardTitle>
          </CardHeader>
          <CardBody className="pt-0">

            {/* Row 1 — Basic identity */}
            <SectionLabel>Basic info</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>

            {/* Row 2 — Demographics */}
            <SectionLabel className="mt-6">Personal details</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Country"
                placeholder="e.g. Ghana"
                value={form.country ?? ""}
                onChange={(e) => set("country", e.target.value)}
              />

              <SelectField
                label="Gender"
                value={form.gender ?? ""}
                onChange={(v) => set("gender", v as User["gender"])}
                options={GENDER_OPTIONS}
                placeholder="Select gender"
              />

              <SelectField
                label="Level of education"
                value={form.educationLevel ?? ""}
                onChange={(v) => set("educationLevel", v as EducationLevel)}
                options={EDUCATION_OPTIONS}
                placeholder="Select level"
              />
            </div>

            {/* Row 3 — Academic */}
            <SectionLabel className="mt-6">Academic background</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Institution / School"
                placeholder="e.g. KNUST"
                value={form.institution ?? ""}
                onChange={(e) => set("institution", e.target.value)}
              />
              <Input
                label="Field of study / Major"
                placeholder="e.g. Computer Engineering"
                value={form.fieldOfStudy ?? ""}
                onChange={(e) => set("fieldOfStudy", e.target.value)}
              />
            </div>

            {/* Row 4 — Study preferences */}
            <SectionLabel className="mt-6">Study preferences</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SelectField
                label="Primary language"
                value={form.primaryLanguage ?? ""}
                onChange={(v) => set("primaryLanguage", v)}
                options={LANGUAGE_OPTIONS.map((l) => ({ value: l, label: l }))}
                placeholder="Select language"
              />

              <SelectField
                label="Study goal"
                value={form.studyGoal ?? ""}
                onChange={(v) => set("studyGoal", v as StudyGoal)}
                options={GOAL_OPTIONS}
                placeholder="Select goal"
              />

              <Input
                label="Weekly study target (hrs)"
                type="number"
                min={1}
                max={80}
                value={form.weeklyStudyHours ?? ""}
                onChange={(e) => set("weeklyStudyHours", Number(e.target.value))}
              />

              <SelectField
                label="Preferred study time"
                value={form.preferredTime ?? ""}
                onChange={(v) => set("preferredTime", v as StudyTime)}
                options={STUDY_TIME_OPTIONS}
                placeholder="Select time"
              />
            </div>

            {/* Save bar */}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-silver-200 pt-5 dark:border-abyss-700">
              {saveErr && (
                <p className="text-sm text-rose-500">{saveErr}</p>
              )}
              {saved && !saveErr && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Changes saved.</p>
              )}
              {!saved && !saveErr && <span />}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setForm({ name: user?.name, email: user?.email })}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" /> Save changes
                </Button>
              </div>
            </div>

          </CardBody>
        </Card>

      </div>
    </PageContainer>
  );
}

// ── Small reusable layout helpers ────────────────────────────

function SettingsRow({
  label,
  description,
  children,
}: {
  label:       string;
  description: string;
  children:    React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-silver-800 dark:text-cobalt-200">{label}</p>
        <p className="text-xs text-silver-500 dark:text-cobalt-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mb-3 text-xs font-semibold uppercase tracking-widest text-silver-400 dark:text-cobalt-400/60", className)}>
      {children}
    </p>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  options:     { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-silver-700 dark:text-cobalt-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-silver-300 bg-white px-3.5 text-sm text-silver-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 dark:border-abyss-600 dark:bg-abyss-800/60 dark:text-cobalt-100 dark:focus:border-cobalt-400 dark:focus:ring-cobalt-400/20"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
