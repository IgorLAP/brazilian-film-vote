import React, { useContext } from "react";

import { useRouter } from "next/router";

import { makeUserSignIn } from "~/factories/user";
import { AuthContext, LoadingContext } from "~/presentation/contexts";
import { useToast } from "~/presentation/hooks/useToast";

export const useSignIn = () => {
  const { setUser } = useContext(AuthContext);
  const { handleLoading, clearLoading } = useContext(LoadingContext);
  const toast = useToast();
  const router = useRouter();
  const userSignIn = makeUserSignIn();

  const [form, setForm] = React.useState({ email: "", password: "" });

  const emailRegex = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const isEmailValid = form.email.match(emailRegex);
  const isPasswordRequiredMinimunLength =
    form.password !== "" && form.password.length >= 6;
  const isFormInvalid = !isEmailValid || !isPasswordRequiredMinimunLength;

  async function onSignIn() {
    if (isFormInvalid) return;
    try {
      handleLoading(10, 1000);
      const user = await userSignIn.signIn(form.email, form.password);

      setUser({
        uid: user.uid,
        email: user.email,
        name: user.name,
        photoURL: user.avatar,
        role: user.role,
      });

      redirectsUserAfterSignin(user.role);
    } catch (err) {
      if (err) clearLoading();
      toast("error", err?.message || "Erro ao fazer login");
    }
  }

  function redirectsUserAfterSignin(role: "ADMIN" | "USER") {
    if (role === "ADMIN") {
      router.push("/admin");
      return;
    }
    router.push("/user");
  }

  function onChange(field: "email" | "password", value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return {
    onSignIn,
    onChangeEmail: (val) => onChange("email", val),
    onChangePassword: (val) => onChange("password", val),
    isEmailValid,
    isPasswordValid: isPasswordRequiredMinimunLength,
  };
};
