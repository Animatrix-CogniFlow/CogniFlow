import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { User } from "../lib/types";

export interface Credentials {
  email:    string;
  password: string;
  name?:    string;
}

const AVATAR_COLORS = ["#3366ff", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b"];
const googleProvider = new GoogleAuthProvider();

// ── Helpers ──────────────────────────────────────────────────

async function getOrCreateProfile(
  uid: string,
  email: string,
  displayName: string
): Promise<User> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as User;

  // First-time Google sign-in — create profile
  const profile: User = {
    id:          uid,
    name:        displayName || "New Learner",
    email,
    avatarColor: AVATAR_COLORS[displayName.length % AVATAR_COLORS.length],
    plan:        "free",
  };
  await setDoc(ref, profile);
  return profile;
}

// ── Service ───────────────────────────────────────────────────

export const authService = {

  // ── Email / password sign-in ──────────────────────────────
  async signIn({ email, password }: Credentials): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) throw new Error("User profile not found.");
    return snap.data() as User;
  },

  // ── Email / password sign-up ──────────────────────────────
  async signUp({ email, password, name }: Credentials): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    const displayName = name?.trim() || "New Learner";
    await firebaseUpdateProfile(user, { displayName });

    // Send verification email (non-blocking — don't throw if it fails)
    sendEmailVerification(user).catch(() => {});

    const profile: User = {
      id:          user.uid,
      name:        displayName,
      email:       user.email!,
      avatarColor: AVATAR_COLORS[displayName.length % AVATAR_COLORS.length],
      plan:        "free",
    };

    await setDoc(doc(db, "users", user.uid), profile);
    return profile;
  },

  // ── Google sign-in ────────────────────────────────────────
  async signInWithGoogle(): Promise<User> {
    const { user } = await signInWithPopup(auth, googleProvider);
    return getOrCreateProfile(
      user.uid,
      user.email!,
      user.displayName ?? "New Learner"
    );
  },

  // ── Resend verification email ─────────────────────────────
  async resendVerification(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in.");
    await sendEmailVerification(user);
  },

  // ── Profile update ────────────────────────────────────────
  async updateProfile(updated: User): Promise<void> {
    const { id, ...fields } = updated;
    // Firestore does not support 'undefined' values, filter them out.
    const cleanFields = Object.entries(fields).reduce((acc, [key, val]) => {
      if (val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {} as Record<string, any>);

    try {
      await updateDoc(doc(db, "users", id), cleanFields);
      if (auth.currentUser && fields.name) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: fields.name });
      }
    } catch (err) {
      console.error("Firestore updateProfile error:", err);
      throw err;
    }
  },

  // ── Password reset ────────────────────────────────────────
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // ── Delete account ────────────────────────────────────────
  // For email/password users: re-authenticate with password before deleting.
  // For Google users: re-authenticate with Google popup.
  async deleteAccount(password?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in.");

    // Re-authenticate first (Firebase requires recent auth for deletion)
    const providerId = user.providerData[0]?.providerId;
    if (providerId === "google.com") {
      await reauthenticateWithPopup(user, googleProvider);
    } else if (password) {
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
    } else {
      throw new Error("Password required to delete account.");
    }

    // Delete Firestore profile doc then the Firebase Auth account
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);
  },

  // ── Sign out ──────────────────────────────────────────────
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },
};