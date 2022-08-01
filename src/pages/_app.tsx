import React from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";

import { AuthProvider } from "~/contexts/AuthContext";
import { theme } from "~/styles/theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </AuthProvider>
  );
}

export default MyApp;
