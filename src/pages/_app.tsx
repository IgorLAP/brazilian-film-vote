import React from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";

import { Layout } from "~/components/Layout";
import { AuthProvider } from "~/contexts/AuthContext";
import { theme } from "~/styles/theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </AuthProvider>
  );
}

export default MyApp;
