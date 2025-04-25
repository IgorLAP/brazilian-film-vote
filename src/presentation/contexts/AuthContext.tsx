import React, { createContext, useEffect, useState } from "react";

import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { setCookie } from "nookies";

import { useToast } from "~/presentation/hooks/useToast";

interface LoggedUser {
  name: string;
  uid: string;
  photoURL: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthContextInitial {
  user: LoggedUser;
  setUser: (user: LoggedUser) => void;
}

const initialValue = {} as AuthContextInitial;

// FIXME: Com a mudança de responsabilidades transformar em userContext, diminuir as idas ao firebase para consulta de informações e armazena-las de uma vez no context
export const AuthContext = createContext<AuthContextInitial>(initialValue);

// AuthProvider com muita responsabilidade
// Ideia é ele prover apenas o user, sendo um context de usuário e assim criar um fluxo próprio para signin, signout e update, com um desacoplamento maior da lógica em si do firebase
// dependendo de uma abstração do mesmo
export function AuthProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
