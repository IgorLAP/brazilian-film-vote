import React, { useContext, useState } from "react";
import { IoIosMail } from "react-icons/io";
import { RiLock2Fill } from "react-icons/ri";

import {
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Stack,
  Text,
  Icon,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { CustomButton } from "~/components/CustomButton";
import AuthContext from "~/contexts/AuthContext";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";

export default function Home() {
  const { signIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (err) {
      showToast("error", err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Brazilian film vote</title>
      </Head>
      <Grid
        as="main"
        h="100vh"
        templateColumns="1fr 480px 420px 1fr"
        templateRows="1fr 480px 1fr"
        templateAreas="
        '. . . .'
        '. text form .'
        '. . . .'
      "
        justifyContent="center"
        alignItems="center"
      >
        <Flex gridArea="text" flexDir="column" alignItems="flex-end" mr="4">
          <Heading as="h1">
            🎬
            <Text color="green.500" as="span">
              b
            </Text>
            <Text color="yellow.500" as="span">
              r
            </Text>
            azilian film vote
          </Heading>
          <Text mt="2" textAlign="end" fontSize="lg">
            Faça login na plataforma para eleger os melhores filmes junto à
            cinfefilia brasileira
          </Text>
        </Flex>
        <Flex
          bg="gray.800"
          gridArea="form"
          align="center"
          justify="center"
          p="8"
          borderRadius={8}
        >
          <Flex h="100%" as="form" flexDir="column">
            <Stack spacing="4">
              <Flex justify="center" align="center">
                <Icon as={IoIosMail} w={6} h={6} />
                <Input
                  placeholder="E-mail"
                  type="email"
                  border="blue.50"
                  bg="gray.900"
                  w="320px"
                  ml="2"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Flex>
              <Flex justify="center" align="center">
                <Icon as={RiLock2Fill} w={6} h={6} />
                <Input
                  placeholder="Senha"
                  type="password"
                  border="blue.60"
                  bg="gray.900"
                  w="320px"
                  ml="2"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Flex>
              <Button
                variant="unstyled"
                textAlign="start"
                size="xs"
                fontWeight="bold"
                color="blue.500"
                _hover={{ color: "blue.600" }}
              >
                Esqueci minha senha
              </Button>
              <CustomButton
                type="button"
                buttonType="primary"
                disabled={loading}
                onClick={handleLogin}
              >
                Entrar
              </CustomButton>
            </Stack>
          </Flex>
        </Flex>
      </Grid>
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
