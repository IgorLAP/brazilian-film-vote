import React from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";

import { Header } from "~/components/Header";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";

export default function Admin() {
  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <Header />
      <h1>Admin</h1>
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
