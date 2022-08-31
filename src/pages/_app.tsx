import "react-toastify/dist/ReactToastify.css";

import React from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";

import { App } from "~/components/App";
import { theme } from "~/styles/theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <App>
        <Component {...pageProps} />
      </App>
      <ToastContainer newestOnTop />
    </ChakraProvider>
  );
}

export default MyApp;
