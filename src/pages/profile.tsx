import React from "react";

import { GetServerSideProps } from "next";

import { Header } from "~/components/Header";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";

export default function Profile() {
  return (
    <>
      <Header />
      <h1>Profile</h1>
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
