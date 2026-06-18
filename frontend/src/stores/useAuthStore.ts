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
        } catch {
          set({ status: "idle", error: "Unable to sign in. Check your credentials." });
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
          // User closed the popup — don't show an error for that
          if (msg.includes("popup-closed")) {
            set({ status: "idle" });
          } else {
            set({ status: "idle", error: msg });
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
          const msg = err instanceof Error ? err.message : "";
          const friendly = msg.includes("email-already-in-use")
            ? "An account with this email already exists."
            : msg.includes("weak-password")
            ? "Password is too weak. Use at least 6 characters."
            : "Unable to create account. Please try again.";
          set({ status: "idle", error: friendly });
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