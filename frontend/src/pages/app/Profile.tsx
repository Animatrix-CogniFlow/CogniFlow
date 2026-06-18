// ============================================================
// Profile.tsx — user profile editing + delete account
// Place at: src/pages/app/Profile.tsx
// Add route in your router: <Route path="/app/profile" element={<Profile />} />
// ============================================================

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon, Mail, Palette, Shield,
  Trash2, CheckCircle2, AlertTriangle, Lock,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/useAuthStore";
import { cn } from "../../lib/utils";

const AVATAR_COLORS = [
  { hex: "#3366ff", label: "Cobalt"   },
  { hex: "#7c3aed", label: "Violet"   },
  { hex: "#0ea5e9", label: "Sky"      },
  { hex: "#10b981", label: "Emerald"  },
  { hex: "#f59e0b", label: "Amber"    },
  { hex: "#ef4444", label: "Rose"     },
  { hex: "#b8900f", label: "Gold"     },
];

export default function Profile() {
  const navigate   = useNavigate();
  const user       = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const signOut    = useAuthStore((s) => s.signOut);
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const emailVerified = useAuthStore((s) => s.emailVerified);

  // ── Profile edit state ─────────────────────────────────────
  const [name, setName]               = useState(user?.name ?? "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor ?? AVATAR_COLORS[0].hex);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [profileError, setProfileError] = useState("");

  // ── Delete account state ───────────────────────────────────
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState("");

  // ── Resend verification ───────────────────────────────────
  const [resentVerification, setResentVerification] = useState(false);

  if (!user) return null;

  // Detect if user signed in with Google (no password needed for deletion)
  const isGoogleUser = !user.email?.includes("@") ||
    !!window.__firebaseAuth?.currentUser?.providerData?.find(
      (p: { providerId: string }) => p.providerId === "google.com"
    );

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return;
    setSaving(true);
    setProfileError("");
    try {
      await updateUser({ name: name.trim(), avatarColor });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setProfileError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(deletePassword || undefined);
      navigate("/signin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setDeleteError(
        msg.includes("wrong-password") || msg.includes("invalid-credential")
          ? "Incorrect password. Please try again."
          : msg.includes("requires-recent-login")
          ? "Please sign out and sign back in before deleting your account."
          : "Could not delete account. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleResendVerification() {
    await resendVerification();
    setResentVerification(true);
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-silver-600 dark:text-cobalt-400/70">
          Manage your account details and preferences.
        </p>
      </div>

      <div className="mx-auto max-w-xl space-y-6">

        {/* ── Email verification banner ── */}
        {!emailVerified && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-700/40 dark:bg-amber-900/20">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Email not verified
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300/70">
                Verify your email to unlock all features.{" "}
                {resentVerification ? (
                  <span className="font-medium text-emerald-600">Link resent!</span>
                ) : (
                  <button
                    onClick={handleResendVerification}
                    className="font-medium text-amber-700 underline dark:text-amber-300"
                  >
                    Resend verification email
                  </button>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── Profile card ── */}
        <Card>
          <CardBody>
            <div className="mb-5 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {name.trim().charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-display font-semibold tracking-tight">{user.name}</p>
                <p className="text-xs text-silver-500 dark:text-cobalt-400/60">{user.email}</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-5">
              <Input
                label="Full name"
                name="name"
                value={name}
                icon={<UserIcon className="h-4 w-4" />}
                onChange={(e) => setName(e.target.value)}
                error={name.trim().length < 2 && name.length > 0 ? "Name too short" : undefined}
              />

              <div>
                <p className="mb-2 text-sm font-medium text-silver-700 dark:text-cobalt-300">
                  <span className="flex items-center gap-1.5">
                    <Palette className="h-4 w-4" /> Avatar colour
                  </span>
                </p>
                <div className="flex gap-2.5">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      onClick={() => setAvatarColor(c.hex)}
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform",
                        avatarColor === c.hex && "ring-2 ring-offset-2 ring-offset-white scale-110 dark:ring-offset-abyss-800"
                      )}
                      style={{ backgroundColor: c.hex, outline: avatarColor === c.hex ? `2px solid ${c.hex}` : "none" }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-silver-200 bg-silver-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
                <Mail className="h-4 w-4 shrink-0 text-silver-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-silver-600 dark:text-cobalt-400/60">Email</p>
                  <p className="truncate text-sm">{user.email}</p>
                </div>
                {emailVerified && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-silver-200 bg-silver-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
                <Shield className="h-4 w-4 shrink-0 text-silver-400" />
                <div>
                  <p className="text-xs font-medium text-silver-600 dark:text-cobalt-400/60">Plan</p>
                  <p className="text-sm capitalize">{user.plan ?? "Free"}</p>
                </div>
              </div>

              {profileError && <p className="text-sm text-rose-500">{profileError}</p>}

              <div className="flex items-center gap-3">
                <Button type="submit" loading={saving} disabled={name.trim().length < 2}>
                  Save changes
                </Button>
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-sm text-emerald-600"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Saved
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* ── Password reset ── */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="h-5 w-5 text-silver-400" />
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-xs text-silver-500 dark:text-cobalt-400/60">
                    Send a password reset link to your email
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const { authService } = await import("../../services/authService");
                  await authService.resetPassword(user.email);
                  alert(`Reset link sent to ${user.email}`);
                }}
              >
                Reset password
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* ── Danger zone ── */}
        <Card className="border-rose-300/50 dark:border-rose-800/40">
          <CardBody>
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
              <h3 className="font-display font-semibold tracking-tight">Danger zone</h3>
            </div>
            <p className="mt-1.5 text-sm text-silver-600 dark:text-cobalt-400/60">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>

            {!deleteOpen ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800/40 dark:text-rose-400 dark:hover:bg-rose-900/20"
                onClick={() => setDeleteOpen(true)}
              >
                Delete my account
              </Button>
            ) : (
              <AnimatePresence>
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  onSubmit={handleDelete}
                  className="mt-4 space-y-3"
                >
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-300">
                    <strong>This will permanently delete your account</strong>, all uploaded
                    documents, flashcard decks, and session history.
                  </div>

                  {!isGoogleUser && (
                    <Input
                      label="Confirm your password"
                      name="deletePassword"
                      type="password"
                      value={deletePassword}
                      icon={<Lock className="h-4 w-4" />}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password to confirm"
                    />
                  )}

                  {deleteError && <p className="text-sm text-rose-500">{deleteError}</p>}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="danger"
                      size="sm"
                      loading={deleting}
                      disabled={!isGoogleUser && deletePassword.length < 1}
                    >
                      Yes, delete my account
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setDeleteOpen(false); setDeleteError(""); setDeletePassword(""); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.form>
              </AnimatePresence>
            )}
          </CardBody>
        </Card>

        {/* Sign out */}
        <div className="text-center">
          <button
            onClick={async () => { await signOut(); navigate("/signin"); }}
            className="text-sm text-silver-500 hover:text-rose-500 dark:text-cobalt-400/60 dark:hover:text-rose-400"
          >
            Sign out
          </button>
        </div>
      </div>
    </PageContainer>
  );
}