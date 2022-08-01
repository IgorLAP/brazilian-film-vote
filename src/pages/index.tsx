import React, { useContext, useState } from "react";

import { LockIcon, EmailIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  Icon,
  Divider,
} from "@chakra-ui/react";

import AuthContext from "~/contexts/AuthContext";

export default function Home() {
  const { signIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    signIn(email, password);
  }

  return (
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
          Faça login na plataforma para votar nos melhores filmes da década de
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
              <Icon as={EmailIcon} w={5} h={5} />
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
              <Icon as={LockIcon} w={5} h={5} />
              <Input
                placeholder="Senha"
                type="password"
                border="blue.50"
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
              color="blue.400"
              _hover={{ color: "blue.500" }}
            >
              Esqueci minha senha
            </Button>
            <Button
              type="button"
              bg="blue.500"
              _hover={{ bg: "blue.600" }}
              onClick={handleLogin}
            >
              Entrar
            </Button>
          </Stack>
          <Divider my="4" />
          <Text fontSize="small">
            Não tem uma conta?{" "}
            <Link
              as="a"
              href="/register"
              fontWeight="bold"
              color="blue.400"
              _hover={{ color: "blue.500" }}
            >
              Registre-se
            </Link>
          </Text>
        </Flex>
      </Flex>
    </Grid>
  );
}
