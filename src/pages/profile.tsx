import React from "react";

import { GetServerSideProps } from "next";

import { Header } from "~/components/Header";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { firebaseAdmin } from "~/lib/firebase-admin";

export default function Profile() {
  return (
    <>
      <Header />
      <h1>Profile</h1>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async ({ req }) => {
    // const { token } = req.cookies;

    // const verify = await firebaseAdmin.auth().verifyIdToken(token);

    return {
      props: {},
    };
  }
);
