import React, { useEffect, useState } from "react";

import {
  Button,
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
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Head from "next/head";
import Router from "next/router";

import { db as webDb } from "~/lib/firebase";
import { User } from "~/models/User";

export default function singnIn() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      alert("Invalid link, request another one");
      Router.push("/");
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
      const newUser = new User(email, name);
      await setDoc(doc(webDb, "users", user.uid), newUser);
      Router.push("/profile");
    } catch (err) {
      console.log(err);
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
            <Button
              bg="blue.500"
              _hover={{ bg: "blue.600" }}
              alignSelf="flex-end"
              type="button"
              disabled={!name || !email || !password}
              onClick={handleSubmit}
            >
              Cadastrar
            </Button>
          </Stack>
        </Flex>
      </Flex>
    </>
  );
}
