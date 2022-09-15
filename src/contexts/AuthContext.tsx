import React, { createContext, useContext, useEffect, useState } from "react";

import axios from "axios";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";

import { getUserByEmail } from "~/helpers/get-user-by-email";
import { useToast } from "~/hooks/useToast";

import { LoadingContext } from "./LoadingContext";

interface LoggedUser {
  name: string;
  uid: string;
  photoURL: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthContextInitial {
  user: LoggedUser;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  onUpdate: (name?: string, photoURL?: string) => Promise<void>;
}

const initialValue = {} as AuthContextInitial;

const AuthContext = createContext<AuthContextInitial>(initialValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const auth = getAuth();

  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<LoggedUser>(null);

  useEffect(() => {
    try {
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
      });
    } catch (err) {
      toast("error", err.message);
    }

    if (user && !auth.currentUser) setUser(null);
  }, []);

  useEffect(() => {
    if (!!auth.currentUser && router.pathname === "/") {
      if (user.role === "USER") router.push("/user");
      if (user.role === "ADMIN") router.push("/admin");
    }
  }, [user]);

  async function signIn(email: string, password: string) {
    try {
      handleLoading(10, 1000);
      const { user: loggedUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid, photoURL, displayName } = loggedUser;
      const userDoc = await getUserByEmail(loggedUser.email);
      await updateProfile(loggedUser, { displayName: userDoc.name });

      const token = await loggedUser.getIdToken();
      setCookie(undefined, "token", token, { path: "/" });

      setUser({
        uid,
        email: userDoc.email,
        name: displayName || userDoc.name,
        photoURL,
        role: userDoc.role,
      });

      if (userDoc.role === "ADMIN") {
        const { admin } = (await auth.currentUser.getIdTokenResult(true))
          .claims;
        if (!admin) {
          await axios.post("/api/set-user-claim", { uid });
        }
        router.push("/admin");
        return;
      }
      router.push("/user");
    } catch (err) {
      if (err) clearLoading();
      throw new Error(err);
    }
  }

  async function signOut() {
    try {
      handleLoading(60, 500);
      await firebaseSignOut(auth);
      destroyCookie(undefined, "token");
      const token = parseCookies();
      if (token)
        document.cookie = `token=; Max-Age=0; path=/; domain=${window.location.hostname}`;
      router.push("/");
    } catch (err) {
      authError(err);
    }
  }

  async function onUpdate(name?: string, photoURL?: string) {
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL,
      });
      const newInfos = { ...user, name, photoURL };
      setUser(newInfos);
      toast("success", "Atualizado com sucesso");
    } catch (err) {
      toast("error", err.message);
    }
  }

  function authError(err) {
    clearLoading();
    toast("error", err.message);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, onUpdate }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
