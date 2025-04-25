import { useContext } from "react";

import { useRouter } from "next/router";

import { makeUserSignOut } from "~/factories/user";
import { LoadingContext } from "~/presentation/contexts";
import { useToast } from "~/presentation/hooks/useToast";

export const useSignOut = () => {
  const { handleLoading } = useContext(LoadingContext);
  const userSignOut = makeUserSignOut();
  const router = useRouter();
  const toast = useToast();

  const onSignOut = async () => {
    try {
      handleLoading(60, 500);
      await userSignOut.signOut();
      router.push("/");
    } catch (err) {
      // FIXME: Padronizar mensagens de erro e mapear os mais comuns do firebase
      toast("error", "Something went wrong");
    }
  };

  return {
    onSignOut,
  };
};
