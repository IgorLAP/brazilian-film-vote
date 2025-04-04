import { Button, Field, Flex, FlexProps, Input, Stack } from "@chakra-ui/react";
import { IoIosMail } from "react-icons/io";
import { RiLock2Fill } from "react-icons/ri";

import { useSignIn } from "~/application/user/hooks";

import { CustomButton } from "../CustomButton";
import { InputGroup } from "../ui/input-group";

// FIXME: Deixar o default dos inputs sem os erros e validar após digitação
export function SignInForm(props: FlexProps) {
  const {
    isEmailValid,
    isPasswordValid,
    onSignIn,
    onChangeEmail,
    onChangePassword,
  } = useSignIn();

  return (
    <Flex
      bg="gray.800"
      align="center"
      justify="center"
      w="100%"
      maxW="460px"
      mx="auto"
      my="0"
      py={{ base: "4", md: "8" }}
      px={{ base: "6", md: "8" }}
      borderRadius={8}
      {...props}
    >
      <Stack
        w={{ base: "100%", md: "inherit" }}
        h="100%"
        as="form"
        flexDir="column"
        onSubmit={onSignIn}
      >
        <Field.Root invalid={!isEmailValid}>
          <InputGroup
            startElementProps={{ color: "white" }}
            startElement={<IoIosMail />}
            width="100%"
          >
            <Input
              placeholder="E-mail"
              type="email"
              border="blue.50"
              bg="gray.900"
              size={{ base: "sm", sm: "md" }}
              w={{ base: "100%", md: "320px" }}
              width="100%"
              onChange={(e) => onChangeEmail(e.target.value)}
            />
          </InputGroup>
          {!isEmailValid && (
            <Field.ErrorText>Email é obrigatório</Field.ErrorText>
          )}
        </Field.Root>
        <Field.Root invalid={!isPasswordValid}>
          <InputGroup
            startElementProps={{ color: "white" }}
            startElement={<RiLock2Fill />}
            width="100%"
          >
            <Input
              placeholder="Senha"
              type="password"
              border="blue.60"
              bg="gray.900"
              size={{ base: "sm", sm: "md" }}
              w={{ base: "100%", md: "320px" }}
              width="100%"
              onChange={(e) => onChangePassword(e.target.value)}
            />
          </InputGroup>
          {!isPasswordValid && (
            <Field.ErrorText>
              Senha deve conter no mínimo 6 digitos
            </Field.ErrorText>
          )}
        </Field.Root>
        <CustomButton w="100%" type="submit" buttonType="primary" color="white">
          Entrar
        </CustomButton>
        <Button
          variant="ghost"
          textAlign="start"
          size="xs"
          fontWeight="bold"
          color="blue.500"
          h="fit-content"
          _hover={{ color: "blue.600", background: "transparent" }}
        >
          Esqueci minha senha
        </Button>
      </Stack>
    </Flex>
  );
}
