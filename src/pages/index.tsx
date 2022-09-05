import React from "react";

import { Grid } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { MainLogo } from "~/components/Home/MainLogo";
import { SignInForm } from "~/components/Home/SignInForm";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";

export default function Home() {
  return (
    <>
      <Head>
        <title>Brazilian Film Vote</title>
      </Head>
      <Grid
        h="100vh"
        mx={{ base: "4", md: "0" }}
        templateColumns={{
          base: "1fr",
          md: "1fr 380px 360px 1fr",
          lg: "1fr 480px 420px 1fr",
        }}
        templateRows={{ base: "1fr 220px 220px 1fr", md: "1fr 480px 1fr" }}
        templateAreas={{
          base: "'.''text''form''.'",
          md: "'. . . .''. text form .''. . . .'",
        }}
        justifyContent="center"
        alignItems="center"
      >
        <MainLogo gridArea="text" />
        <SignInForm gridArea="form" />
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
