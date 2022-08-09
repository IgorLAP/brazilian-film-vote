import React, { createContext, useEffect, useState } from "react";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import Router from "next/router";
import { destroyCookie, setCookie } from "nookies";

import { getUserByEmail } from "~/helpers/get-user-by-email";

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
}

const initialValue = {} as IinitialValue;

const AuthContext = createContext<IinitialValue>(initialValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = getAuth();

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
    });
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const { user: loggedUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid, photoURL } = loggedUser;
      const token = await loggedUser.getIdToken();
      setCookie(undefined, "token", token, { path: "/" });
      const userDoc = await getUserByEmail(loggedUser.email);
      setUser({
        uid,
        email: loggedUser.email,
        name: userDoc.name,
        photoURL,
        role: userDoc.role,
      });
      if (userDoc.role === "ADMIN") {
        Router.push("/admin");
        return;
      }
      Router.push("/user");
    } catch (err) {
      console.log(err);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUser(null);
    destroyCookie(undefined, "token");
    Router.push("/");
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
