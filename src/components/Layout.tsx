import React from "react";

import { Box, Flex } from "@chakra-ui/react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Header />
      <Flex maxW="1180" my="0" mx="auto" py="4">
        <Sidebar />
        <div style={{ width: "100%" }}>{children}</div>
      </Flex>
    </Box>
  );
}
