import React, { createContext, useState } from "react";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import Router from "next/router";
import "~/lib/firebase";

interface IinitialValue {
  user: User;
  signIn: (email: string, password: string) => void;
  signOut: () => Promise<void>;
}

const initialValue = {} as IinitialValue;

const AuthContext = createContext<IinitialValue>(initialValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  const auth = getAuth();

  async function signIn(email: string, password: string) {
    const { user: loggedUser } = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    setUser(loggedUser);
    Router.push("/profile");
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

export const AuthConsumer = AuthContext.Consumer;

export default AuthContext;
