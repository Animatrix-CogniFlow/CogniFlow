import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) return;
    setLoading(true);
    await authService.resetPassword(email);
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthLayout title="Reset password" subtitle="We'll send recovery instructions to your inbox.">
      {sent ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
            If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            icon={<Mail className="h-4 w-4" />}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-silver-600 dark:text-silver-600">
        <Link to="/signin" className="font-medium text-gold-600 hover:underline dark:text-gold-600">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
