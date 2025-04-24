import { useRouter } from "next/router";
import { useContext } from "react";

import { makeUserSignOut } from "~/factories/user";
import { LoadingContext } from "~/presentation/contexts";

export const useSignOut = () => {
  const { handleLoading } = useContext(LoadingContext);
  const useSignOut = makeUserSignOut();
  const router = useRouter();

  const onSignOut = async () => {
    try {
      handleLoading(60, 500);
      await useSignOut.signOut();
      router.push("/");
    } catch (err) {
      //FIXME: mostrar erro
    }
  };

  return {
    onSignOut,
  };
};

