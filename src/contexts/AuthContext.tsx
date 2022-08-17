import React, { createContext, useEffect, useState } from "react";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/router";
import { destroyCookie, setCookie } from "nookies";

import { getUserByEmail } from "~/helpers/get-user-by-email";
import { showToast } from "~/helpers/showToast";

interface LoggedUser {
  name: string;
  uid: string;
  photoURL: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface IinitialValue {
  user: LoggedUser;
  signIn: (email: string, password: string) => void;
  signOut: () => Promise<void>;
  onUpdate: (name?: string, photoURL?: string) => Promise<void>;
}

const initialValue = {} as IinitialValue;

const AuthContext = createContext<IinitialValue>(initialValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = getAuth();
  const router = useRouter();

  const [user, setUser] = useState<LoggedUser>(null);

  useEffect(() => {
    auth.onIdTokenChanged(async (sessionUser) => {
      if (sessionUser) {
        const { admin } = (await auth.currentUser.getIdTokenResult(true))
          .claims;
        const { uid, displayName, photoURL, email } = sessionUser;
        setUser({
          uid,
          name: displayName,
          photoURL,
          email,
          role: admin ? "ADMIN" : "USER",
        });
        const token = await sessionUser.getIdToken();
        setCookie(undefined, "token", token, { path: "/" });
      }
      // Improve auto signout method
      if (!sessionUser && auth.currentUser) signOut();
    });
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const { user: loggedUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid, photoURL, displayName } = loggedUser;
      const token = await loggedUser.getIdToken();
      setCookie(undefined, "token", token, { path: "/" });
      const userDoc = await getUserByEmail(loggedUser.email);
      setUser({
        uid,
        email: loggedUser.email,
        name: displayName,
        photoURL,
        role: userDoc.role,
      });
      if (userDoc.role === "ADMIN") {
        router.push("/admin");
        return;
      }
      router.push("/user");
    } catch (err) {
      showToast("error", err.message);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUser(null);
    destroyCookie(undefined, "token");
    router.push("/");
  }

  async function onUpdate(name?: string, photoURL?: string) {
    await updateProfile(auth.currentUser, {
      displayName: name,
      photoURL,
    });
    const newInfos = { ...user, name, photoURL };
    setUser(newInfos);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, onUpdate }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
