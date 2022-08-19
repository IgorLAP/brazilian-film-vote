import React from "react";

import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { AuthProvider } from "~/contexts/AuthContext";
import { LoadingProvider } from "~/contexts/LoadingContext";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function App({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const isIndex = router.pathname === "/";

  return (
    <LoadingProvider>
      <AuthProvider>
        <Box>
          {!isIndex && <Header />}
          <Flex maxW="1180" my="0" mx="auto" py={!isIndex ? "4" : ""}>
            {!isIndex && <Sidebar />}
            <div style={{ width: "100%" }}>{children}</div>
          </Flex>
        </Box>
      </AuthProvider>
    </LoadingProvider>
  );
}
