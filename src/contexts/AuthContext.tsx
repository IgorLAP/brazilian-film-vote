import React, { createContext, useEffect, useState } from "react";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import Router from "next/router";
import "~/lib/firebase";

type LoggedUser = Pick<User, "displayName" | "uid" | "photoURL" | "email">;

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
    auth.onAuthStateChanged((session) => {
      if (session) {
        const { uid, displayName, photoURL, email } = session;
        setUser({ uid, displayName, photoURL, email });
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
      const { uid, displayName, photoURL } = loggedUser;
      setUser({
        uid,
        email: loggedUser.email,
        displayName,
        photoURL,
      });
      Router.push("/profile");
    } catch (err) {
      console.log(err);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUser(null);
    Router.push("/");
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
