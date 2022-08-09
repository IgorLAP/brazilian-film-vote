import React from "react";
import { HiPencilAlt } from "react-icons/hi";

import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Image,
  Input,
  Stack,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { db as adminDb, firebaseAdmin } from "~/lib/firebase-admin";

interface ProfileProps {
  user: {
    name: string;
    photoURL: string;
    email: string;
  };
}

export default function Profile({ user }: ProfileProps) {
  return (
    <>
      <Head>
        <title>{user.name} - Perfil</title>
      </Head>
      <Heading as="h1" textAlign="center">
        Perfil
      </Heading>
      <Flex mt="2" justify="center" align="center">
        <Stack
          bg="gray.800"
          py="4"
          px="6"
          w="480px"
          borderRadius={6}
          spacing="4"
        >
          <Box>
            <FormLabel>Nome</FormLabel>
            <Input bg="gray.900" readOnly value={user.name} />
          </Box>
          <Box>
            <FormLabel>Email</FormLabel>
            <Input bg="gray.900" readOnly value={user.email} />
          </Box>
          {user.photoURL ? (
            <Image src={user.photoURL} />
          ) : (
            <Box>
              <FormLabel>Avatar</FormLabel>
              <Input bg="gray.900" readOnly value="Sem avatar" />
            </Box>
          )}
          <Button
            bg="yellow.500"
            alignSelf="flex-end"
            _hover={{ bg: "yellow.600" }}
          >
            <Icon as={HiPencilAlt} mr="2" />
            Editar
          </Button>
        </Stack>
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { token } = req.cookies;
  const { email } = await firebaseAdmin.auth().verifyIdToken(token);
  const userRef = adminDb.collection("users").where("email", "==", email);
  const user = (await userRef.get()).docs[0].data();

  return {
    props: {
      user,
    },
  };
};
