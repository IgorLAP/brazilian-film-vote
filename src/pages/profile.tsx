import React, { useContext, useEffect } from "react";

import {
  Field,
  Flex,
  Heading,
  Icon,
  Input,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { HiPencilAlt } from "react-icons/hi";

import { useUserUpdate } from "~/application/user/hooks";
import { CustomButton } from "~/presentation/components/CustomButton";
import { Modal } from "~/presentation/components/Modal";
import { AuthContext } from "~/presentation/contexts";
import { verifySSRAuth } from "~/presentation/helpers/veritySSRAuth";

export default function Profile() {
  const { user: loggedUser } = useContext(AuthContext);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const {
    form: {
      values: { name, photoURL },
      setters: { setName, setPhotoURL },
    },
    onUpdate,
  } = useUserUpdate(onClose);

  useEffect(() => {
    if (loggedUser) {
      setName(loggedUser?.name);
      setPhotoURL(loggedUser?.photoURL);
    }
  }, [loggedUser]);

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
          >
            <Field.Root>
              <Field.Label>Nome</Field.Label>
              <Input bg="gray.900" readOnly value={loggedUser?.name} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input bg="gray.900" readOnly value={loggedUser?.email} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Avatar</Field.Label>
              <Input
                bg="gray.900"
                readOnly
                value={loggedUser?.photoURL ?? "Sem avatar"}
              />
            </Field.Root>
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
          <Stack mx="4">
            <Field.Root>
              <Field.Label>Nome</Field.Label>
              <Input
                type="text"
                bg="gray.900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Avatar</Field.Label>
              <Input
                type="text"
                bg="gray.900"
                placeholder="URL"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </Field.Root>
          </Stack>
        }
        footerChildren={
          <CustomButton
            disabled={
              photoURL === "" ||
              name?.length <= 5 ||
              (photoURL === loggedUser?.photoURL && name === loggedUser?.name)
            }
            ml="2"
            buttonType="primary"
            onClick={onUpdate}
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
  },
);
