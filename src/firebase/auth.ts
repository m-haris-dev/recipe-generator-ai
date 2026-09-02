import {
  createUserWithEmailAndPassword,
  getAuth,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { app } from "./config";

export const auth = getAuth(app);

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Yeh email already registered hai. Login try karein.";
      case "auth/invalid-email":
        return "Email address theek nahi hai.";
      case "auth/weak-password":
        return "Password kam az kam 6 characters ka hona chahiye.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Email ya password galat hai.";
      case "auth/too-many-requests":
        return "Bohot zyada tries ho gayi hain. Thori dair baad try karein.";
      case "auth/network-request-failed":
        return "Internet connection check karein.";
      default:
        return error.message || "Authentication failed.";
    }
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

function verificationSettings() {
  return {
    url: `${window.location.origin}/`,
    handleCodeInApp: false,
  };
}

export async function signUpWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user, verificationSettings());
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logOut() {
  await signOut(auth);
}

export async function resendVerificationEmail(user: User) {
  await sendEmailVerification(user, verificationSettings());
}

export async function refreshCurrentUser(user: User) {
  await reload(user);
  return auth.currentUser;
}
