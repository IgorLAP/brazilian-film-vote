import React, { useContext, useEffect, useState } from "react";

import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import axios from "axios";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import Head from "next/head";
import { useRouter } from "next/router";

import { CustomButton } from "~/components/CustomButton";
import AuthContext from "~/contexts/AuthContext";
import { LoadingContext } from "~/contexts/LoadingContext";
import { useToast } from "~/hooks/useToast";
import { User } from "~/models/User";

export default function singnIn() {
  const { handleLoading, clearLoading } = useContext(LoadingContext);
  const { user: loggedUser } = useContext(AuthContext);

  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [canSignIn, setCanSignIn] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setCanSignIn(false);
      router.push("/");
      toast("warn", "Link de registro inválido");
    }

    if (auth.currentUser) {
      setCanSignIn(false);
      if (loggedUser?.role === "USER") router.push("/user");
      if (loggedUser?.role === "ADMIN") router.push("/admin");
    }
  }, []);

  async function handleSubmit() {
    try {
      handleLoading(10, 1000);
      const auth = getAuth();
      const { user } = await signInWithEmailLink(
        auth,
        email,
        window.location.href
      );
      await updatePassword(user, password);
      await updateProfile(user, { displayName: name });
      const newUser = new User({ email, name });
      await axios.post("/api/signin", { uid: user.uid, ...newUser });
      router.push("/profile");
    } catch (err) {
      clearLoading();
      toast("error", err.message);
    }
  }

  return (
    <>
      <Head>
        <title>Cadastre-se - Brazilian Film Vote</title>
      </Head>
      <Flex
        maxW="1180px"
        my="0"
        mx={{ base: "2", md: "auto" }}
        flexDir="column"
        justify="center"
        align="center"
        textAlign="center"
      >
        <Heading as="h1">Complete seu cadastro</Heading>
        <Flex
          bg="gray.700"
          as="form"
          flexDir="column"
          maxW="580px"
          w="100%"
          py={{ base: "4", md: "8" }}
          px="6"
          mt="2"
          borderRadius={8}
        >
          <Stack spacing="3">
            <FormControl borderRadius={4}>
              <FormLabel>Nome</FormLabel>
              <Input
                size={{ base: "sm", md: "md" }}
                px={{ base: "0", md: "4" }}
                type="text"
                bg="gray.900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                size={{ base: "sm", md: "md" }}
                px={{ base: "0", md: "4" }}
                type="email"
                bg="gray.900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Senha</FormLabel>
              <Input
                size={{ base: "sm", md: "md" }}
                px={{ base: "0", md: "4" }}
                type="password"
                value={password}
                bg="gray.900"
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirmar senha</FormLabel>
              <Input
                size={{ base: "sm", md: "md" }}
                px={{ base: "0", md: "4" }}
                type="password"
                value={confirmPassword}
                bg="gray.900"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
            <CustomButton
              size={{ base: "sm", md: "md" }}
              buttonType="primary"
              alignSelf="flex-end"
              type="button"
              disabled={
                canSignIn &&
                (!name || !email || !password || password !== confirmPassword)
              }
              onClick={handleSubmit}
            >
              Cadastrar
            </CustomButton>
          </Stack>
        </Flex>
      </Flex>
    </>
  );
}
