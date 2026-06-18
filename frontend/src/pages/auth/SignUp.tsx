import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon, Info } from "lucide-react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/useAuthStore";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function SignUp() {
  const navigate         = useNavigate();
  const signUp           = useAuthStore((s) => s.signUp);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const status           = useAuthStore((s) => s.status);
  const error            = useAuthStore((s) => s.error);
  const clearError       = useAuthStore((s) => s.clearError);

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched]   = useState(false);
  const [done, setDone]         = useState(false); // email verification sent state

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const valid      = name.trim().length >= 2 && emailValid && password.length >= 6;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    const ok = await signUp({ name, email, password });
    if (ok) setDone(true); // show verification banner before redirecting
  }

  async function handleGoogle() {
    clearError();
    const ok = await signInWithGoogle();
    if (ok) navigate("/onboarding");
  }

  // Verification sent — show banner + redirect to onboarding after a moment
  if (done) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One more step before you start.">
        <div className="rounded-2xl border border-cobalt-200 bg-cobalt-50 p-5 text-center dark:border-cobalt-800/40 dark:bg-cobalt-900/20">
          <Mail className="mx-auto h-8 w-8 text-cobalt-500 dark:text-cobalt-300" />
          <p className="mt-3 text-sm text-cobalt-800 dark:text-cobalt-200">
            We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <p className="mt-2 text-xs text-cobalt-600 dark:text-cobalt-400/70">
            You can still use CogniFlow while you verify — some features may be limited until you do.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-silver-200 bg-silver-50 px-4 py-3 text-xs text-silver-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-cobalt-400/60">
          <Info className="h-4 w-4 shrink-0" />
          Didn't receive it? Check your spam folder, or{" "}
          <button
            onClick={() => useAuthStore.getState().resendVerification()}
            className="ml-1 font-medium text-gold-600 hover:underline dark:text-cobalt-300"
          >
            resend
          </button>
          .
        </div>
        <Button className="mt-5 w-full" onClick={() => navigate("/onboarding")}>
          Continue to CogniFlow
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Begin transforming notes into intelligence.">
      {/* Google sign-up */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        loading={status === "loading"}
      >
        <GoogleIcon /> Sign up with Google
      </Button>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-silver-300 dark:bg-white/10" />
        <span className="text-xs text-silver-500 dark:text-cobalt-400/60">or</span>
        <span className="h-px flex-1 bg-silver-300 dark:bg-white/10" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          name="name"
          value={name}
          icon={<UserIcon className="h-4 w-4" />}
          onChange={(e) => setName(e.target.value)}
          error={touched && name.trim().length < 2 ? "Enter your name" : undefined}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          icon={<Mail className="h-4 w-4" />}
          onChange={(e) => setEmail(e.target.value)}
          error={touched && !emailValid ? "Enter a valid email" : undefined}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={password}
          icon={<Lock className="h-4 w-4" />}
          onChange={(e) => setPassword(e.target.value)}
          error={touched && password.length < 6 ? "At least 6 characters" : undefined}
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <Button type="submit" className="w-full" loading={status === "loading"}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-silver-600 dark:text-cobalt-400/60">
        Already have an account?{" "}
        <Link to="/signin" className="font-medium text-gold-600 hover:underline dark:text-cobalt-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}