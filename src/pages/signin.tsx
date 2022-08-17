import React, { useEffect, useState } from "react";

import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Head from "next/head";
import Router from "next/router";

import { CustomButton } from "~/components/CustomButton";
import { showToast } from "~/helpers/showToast";
import { db as webDb } from "~/lib/firebase";
import { User } from "~/models/User";

export default function singnIn() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [canSignIn, setCanSignIn] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setCanSignIn(false);
      Router.push("/");
      showToast("warn", "Link inválido, solicite outro");
    }

    if (auth.currentUser) {
      setCanSignIn(false);
      Router.push("/user");
    }
  }, []);

  async function handleSubmit() {
    try {
      const auth = getAuth();
      const { user } = await signInWithEmailLink(
        auth,
        email,
        window.location.href
      );
      await updatePassword(user, password);
      await updateProfile(user, { displayName: name });
      const newUser = new User({ email, name });
      await setDoc(doc(webDb, "users", user.uid), {
        ...newUser,
      });
      Router.push("/profile");
    } catch (err) {
      showToast("error", err.message);
    }
  }

  return (
    <>
      <Head>
        <title>Complete Signin</title>
      </Head>
      <Flex
        maxW="1180px"
        my="0"
        mx="auto"
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
          w="580px"
          py="8"
          px="6"
          mt="2"
          borderRadius={8}
        >
          <Stack spacing="3">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                bg="gray.900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                bg="gray.900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                bg="gray.900"
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <CustomButton
              buttonType="primary"
              alignSelf="flex-end"
              type="button"
              disabled={canSignIn && (!name || !email || !password)}
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
