import React, { FormEvent, useContext, useState } from "react";

import { Grid } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { LogoHome } from "~/components/Home/LogoHome";
import { SignInForm } from "~/components/Home/SignInForm";
import AuthContext from "~/contexts/AuthContext";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";

export default function Home() {
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
    <>
      <Head>
        <title>Brazilian Film Vote</title>
      </Head>
      <Grid
        as="main"
        h="100vh"
        mx={{ base: "4", md: "0" }}
        templateColumns={{
          base: "1fr",
          md: "1fr 380px 360px 1fr",
          lg: "1fr 480px 420px 1fr",
        }}
        templateRows={{ base: "repeat(2, 1fr)", md: "1fr 480px 1fr" }}
        templateAreas={{
          base: "'text''form'",
          md: "'. . . .''. text form .''. . . .'",
        }}
        justifyContent="center"
        alignItems="center"
      >
        <LogoHome gridArea="text" />
        <SignInForm
          gridArea="form"
          handleLogin={handleLogin}
          loading={loading}
          passRequiredMinimunLength={passRequiredMinimunLength}
          setEmail={setEmail}
          setPassword={setPassword}
          validEmail={validEmail}
        />
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
