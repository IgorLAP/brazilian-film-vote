import { useContext, useState } from "react";

import { makeUserUpdate } from "~/factories/user";
import { AuthContext } from "~/presentation/contexts";
import { useToast } from "~/presentation/hooks/useToast";

export const useUserUpdate = (onClose: () => void) => {
  const userUpdate = makeUserUpdate();
  const toast = useToast();
  const { user, setUser } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const doesImageExist = (url: string): Promise<boolean> => {
    if (!url) return Promise.resolve(false);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  async function handleUpdate() {
    const isImageValid = await doesImageExist(photoURL);
    if (!isImageValid) {
      toast("error", "Imagem inválida");
      return;
    }

    try {
      await userUpdate.update(name, photoURL);
      setUser({
        ...user,
        name,
        photoURL,
      });
      onClose();
    } catch (err) {
      toast("error", err.message);
    }
  }

  console.log("user?", user);

  return {
    form: {
      values: {
        name,
        photoURL,
      },
      setters: {
        setName,
        setPhotoURL,
      },
    },
    onUpdate: handleUpdate,
  };
};
