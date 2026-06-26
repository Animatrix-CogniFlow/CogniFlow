import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../lib/types";
import { authService, type Credentials } from "../services/authService";

interface AuthState {
  user:               User | null;
  status:             "idle" | "loading" | "authenticated";
  emailVerified:      boolean;
  error:              string | null;
  signIn:             (c: Credentials) => Promise<boolean>;
  signInWithGoogle:   () => Promise<boolean>;
  signUp:             (c: Credentials) => Promise<boolean>;
  signOut:            () => Promise<void>;
  updateUser:         (fields: Partial<User>) => Promise<void>;
  deleteAccount:      (password?: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError:         () => void;
}

function getFriendlyErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const msg = err.message || "";
  if (msg.includes("email-already-in-use")) {
    return "An account with this email already exists.";
  }
  if (msg.includes("weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (msg.includes("wrong-password") || msg.includes("invalid-credential") || msg.includes("auth/invalid-login-credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("user-not-found")) {
    return "No account found with this email.";
  }
  if (msg.includes("user-disabled")) {
    return "This account has been disabled.";
  }
  if (msg.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("popup-closed") || msg.includes("popup-closed-by-user")) {
    return "Google sign-in was cancelled.";
  }
  if (msg.includes("network-request-failed")) {
    return "Network error. Please check your internet connection.";
  }
  return msg || fallback;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:          null,
      status:        "idle",
      emailVerified: false,
      error:         null,

      clearError: () => set({ error: null }),

      async signIn(c) {
        set({ status: "loading", error: null });
        try {
          const user = await authService.signIn(c);
          set({
            user,
            status: "authenticated",
            emailVerified: !!authService["_currentFirebaseUser"]?.emailVerified,
          });
          return true;
        } catch (err) {
          set({ status: "idle", error: getFriendlyErrorMessage(err, "Unable to sign in. Check your credentials.") });
          return false;
        }
      },

      async signInWithGoogle() {
        set({ status: "loading", error: null });
        try {
          const user = await authService.signInWithGoogle();
          set({ user, status: "authenticated", emailVerified: true });
          return true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Google sign-in failed.";
          if (msg.includes("popup-closed") || msg.includes("popup-closed-by-user")) {
            set({ status: "idle" });
          } else {
            set({ status: "idle", error: getFriendlyErrorMessage(err, "Google sign-in failed.") });
          }
          return false;
        }
      },

      async signUp(c) {
        set({ status: "loading", error: null });
        try {
          const user = await authService.signUp(c);
          set({ user, status: "authenticated", emailVerified: false });
          return true;
        } catch (err) {
          set({ status: "idle", error: getFriendlyErrorMessage(err, "Unable to create account. Please try again.") });
          return false;
        }
      },

      async signOut() {
        await authService.signOut();
        set({ user: null, status: "idle", emailVerified: false });
      },

      async updateUser(fields) {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...fields };
        await authService.updateProfile(updated);
        set({ user: updated });
      },

      async deleteAccount(password) {
        await authService.deleteAccount(password);
        set({ user: null, status: "idle", emailVerified: false });
      },

      async resendVerification() {
        await authService.resendVerification();
      },
    }),
    {
      name:       "cogniflow-auth",
      partialize: (s) => ({ user: s.user, status: s.status }),
    }
  )
);