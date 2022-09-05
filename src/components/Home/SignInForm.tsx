import React, { useState, useContext, FormEvent } from "react";

import {
  Button,
  Flex,
  HTMLChakraProps,
  Icon,
  Input,
  Stack,
} from "@chakra-ui/react";
import { IoIosMail } from "react-icons/io";
import { RiLock2Fill } from "react-icons/ri";

import AuthContext from "~/contexts/AuthContext";
import { showToast } from "~/helpers/showToast";

import { CustomButton } from "../CustomButton";

export function SignInForm(props: HTMLChakraProps<"div">) {
  const { signIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const validEmail = email.match(emailRegex);
  const passRequiredMinimunLength = password !== "" && password.length >= 6;

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (err) {
      showToast("error", err.message);
      setLoading(false);
    }
  }

  return (
    <Flex
      bg="gray.800"
      align="center"
      justify="center"
      w="100%"
      maxW="460px"
      mx="auto"
      my="0"
      p={{ base: "4", md: "8" }}
      borderRadius={8}
      {...props}
    >
      <Flex
        w={{ base: "90%", md: "inherit" }}
        h="100%"
        as="form"
        flexDir="column"
        onSubmit={handleLogin}
      >
        <Stack spacing="4">
          <Flex justify="center" align="center">
            <Icon as={IoIosMail} w={6} h={6} />
            <Input
              placeholder="E-mail"
              type="email"
              border="blue.50"
              bg="gray.900"
              w={{ base: "100%", md: "320px" }}
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
              w={{ base: "100%", md: "320px" }}
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
            type="submit"
            buttonType="primary"
            disabled={!(!!validEmail && passRequiredMinimunLength) || loading}
          >
            Entrar
          </CustomButton>
        </Stack>
      </Flex>
    </Flex>
  );
}
