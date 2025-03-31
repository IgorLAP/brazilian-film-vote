import React from "react";

import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";

import { AuthProvider } from "~/contexts/AuthContext";
import { LoadingProvider } from "~/contexts/LoadingContext";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function App({ children }: { children: React.ReactNode }) {
  const { token } = parseCookies(undefined);

  const router = useRouter();

  const isIndex = router.pathname === "/";

  return (
    <LoadingProvider>
      <AuthProvider>
        <Box maxWidth="1180px" marginInline="auto">
          {!isIndex && <Header />}
          <Flex>
            {!!token && <Sidebar />}
            <Box as="main" width="100%">
              {children}
            </Box>
          </Flex>
        </Box>
      </AuthProvider>
    </LoadingProvider>
  );
}
