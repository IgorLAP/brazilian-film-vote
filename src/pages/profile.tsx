import React from "react";

import { GetServerSideProps } from "next";

import { firebaseAdmin } from "~/lib/firebase-admin";

export default function Profile() {
  return <h1>Profile</h1>;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { token } = req.cookies;

  if (!token) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const verify = await firebaseAdmin.auth().verifyIdToken(token);

  return {
    props: {},
  };
};
