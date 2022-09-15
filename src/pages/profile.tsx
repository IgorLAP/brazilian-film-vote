import React, { useContext, useEffect, useState } from "react";

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { HiPencilAlt } from "react-icons/hi";

import { CustomButton } from "~/components/CustomButton";
import { Modal } from "~/components/Modal";
import AuthContext from "~/contexts/AuthContext";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { useToast } from "~/hooks/useToast";
import { webDb } from "~/lib/firebase";

export default function Profile() {
  const { user: loggedUser, onUpdate } = useContext(AuthContext);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (loggedUser) {
      setName(loggedUser?.name);
      setEmail(loggedUser?.email);
      setPhotoURL(loggedUser?.photoURL);
    }
  }, [loggedUser]);

  const doesImageExist = (url: string): Promise<boolean> =>
    new Promise((resolve) => {
      const img = new Image();

      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });

  async function handleUpdate() {
    if (photoURL) {
      if (!(await doesImageExist(photoURL))) {
        setPhotoURL("");
        toast("error", "Imagem inválida");
        return;
      }
    }

    try {
      const userDocRef = doc(webDb, "users", loggedUser.uid);
      await updateDoc(userDocRef, {
        name,
        photoURL,
      });
      onUpdate(name, photoURL);
      onClose();
    } catch (err) {
      toast("error", err.message);
    }
  }

  return (
    <>
      <Head>
        <title>Perfil - Brazilian filme vote</title>
      </Head>
      <Flex flexDir="column" justify="center" align="center">
        <Heading as="h1" textAlign="center">
          Perfil
        </Heading>
        <Flex
          mt="2"
          w={{ base: "100%", md: "480px" }}
          justify="center"
          align="center"
        >
          <Stack
            w={{ base: "80%", md: "100%" }}
            bg="gray.800"
            py="4"
            px="6"
            borderRadius={6}
            spacing="4"
          >
            <Box>
              <FormLabel>Nome</FormLabel>
              <Input bg="gray.900" readOnly value={name} />
            </Box>
            <Box>
              <FormLabel>Email</FormLabel>
              <Input bg="gray.900" readOnly value={email} />
            </Box>
            <Box>
              <FormLabel>Avatar</FormLabel>
              <Input bg="gray.900" readOnly value={photoURL ?? "Sem avatar"} />
            </Box>
            <CustomButton
              size={{ base: "sm", sm: "md" }}
              buttonType="warn"
              alignSelf="flex-end"
              onClick={onOpen}
            >
              <Icon as={HiPencilAlt} mr="2" />
              Editar
            </CustomButton>
          </Stack>
        </Flex>
      </Flex>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        headerOptions={{ fontSize: "larger", title: "Editar" }}
        bodyChildren={
          <Stack mx="4" spacing="2">
            <FormControl>
              <FormLabel>Nome</FormLabel>
              <Input
                type="text"
                bg="gray.900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Avatar</FormLabel>
              <Input
                type="text"
                bg="gray.900"
                placeholder="URL"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </FormControl>
          </Stack>
        }
        footerChildren={
          <CustomButton
            disabled={
              name?.length <= 5 ||
              (photoURL === loggedUser?.photoURL && name === loggedUser?.name)
            }
            ml="2"
            buttonType="primary"
            onClick={handleUpdate}
          >
            Salvar
          </CustomButton>
        }
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async () => {
    return {
      props: {},
    };
  }
);
