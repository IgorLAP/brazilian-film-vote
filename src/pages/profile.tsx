import React, { useContext, useEffect, useState } from "react";
import { HiPencilAlt } from "react-icons/hi";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import Head from "next/head";

import { CustomButton } from "~/components/CustomButton";
import AuthContext from "~/contexts/AuthContext";
import { db as webDb } from "~/lib/firebase";

export default function Profile() {
  const { user: loggedUser, onUpdate } = useContext(AuthContext);

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

  const doesImageExist = (url: string) =>
    new Promise((resolve) => {
      const img = new Image();

      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });

  async function handleUpdate() {
    if (photoURL) {
      if (!(await doesImageExist(photoURL))) {
        alert("Imagem invalida");
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
      console.log(err);
    }
  }

  return (
    <>
      <Head>
        <title>{name} - Perfil</title>
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
          <CustomButton buttonType="warn" alignSelf="flex-end" onClick={onOpen}>
            <Icon as={HiPencilAlt} mr="2" />
            Editar
          </CustomButton>
        </Stack>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="larger">Editar</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing="2">
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
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
