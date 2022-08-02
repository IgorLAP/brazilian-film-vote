import React from "react";

import { GetServerSideProps } from "next";

export default function Admin() {
  return <h1>Admin</h1>;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
