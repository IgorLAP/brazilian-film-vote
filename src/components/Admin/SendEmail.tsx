import React, { useState, useContext } from "react";

import {
  FormControl,
  Input,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

import { LoadingContext } from "~/contexts/LoadingContext";
import { useToast } from "~/hooks/useToast";
import { webDb } from "~/lib/firebase";

import { CustomButton } from "../CustomButton";

const actionCodeSetting = {
  url: `${process.env.NEXT_PUBLIC_SITE_URL}/signin`,
  handleCodeInApp: true,
};

export function SendEmail() {
  const { handleLoading, clearLoading } = useContext(LoadingContext);
  const toast = useToast();

  const responsiveText = useBreakpointValue({
    base: true,
    sm: false,
  });

  const [newUserEmail, setNewUserEmail] = useState("");

  async function handleNewUser() {
    try {
      handleLoading(20, 500);
      const auth = getAuth();
      const q = query(
        collection(webDb, "users"),
        where("email", "==", newUserEmail)
      );
      const hasUser = await getDocs(q);
      if (hasUser.empty) {
        await sendSignInLinkToEmail(auth, newUserEmail, actionCodeSetting);
        toast("success", "Email enviado");
        clearLoading();
        setNewUserEmail("");
      } else {
        throw new Error("Email já cadastrado");
      }
    } catch (err) {
      clearLoading();
      toast("error", err.message);
    }
  }

  const emailRegex = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const validEmail = newUserEmail.match(emailRegex);

  return (
    <Stack ml={{ base: "4", xl: "0" }} spacing="4" borderRadius="4">
      <CustomButton
        size={{ base: "sm", md: "md" }}
        w="fit-content"
        buttonType="primary"
        alignSelf="flex-start"
        disabled={!validEmail}
        onClick={handleNewUser}
      >
        Enviar email {responsiveText ? "" : "de cadastro"}
      </CustomButton>

      <FormControl w={{ base: "160px", sm: "240px", md: "420px" }}>
        <Input
          size={{ base: "sm", sm: "md" }}
          bg="white"
          color="black"
          _placeholder={{ color: "gray.500" }}
          type="email"
          placeholder="E-mail"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
        />
      </FormControl>
    </Stack>
  );
}
