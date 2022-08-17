import "react-toastify/dist/ReactToastify.css";

import React from "react";
import { ToastContainer } from "react-toastify";

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
        <ToastContainer newestOnTop />
      </ChakraProvider>
    </AuthProvider>
  );
}

export default MyApp;
