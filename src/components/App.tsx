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
        <Box>
          {!isIndex && <Header />}
          <Flex maxW="1180" my="0" mx="auto" py={!isIndex ? "4" : ""}>
            {!!token && <Sidebar />}
            <Box as="main" style={{ width: "100%" }}>
              {children}
            </Box>
          </Flex>
        </Box>
      </AuthProvider>
    </LoadingProvider>
  );
}
