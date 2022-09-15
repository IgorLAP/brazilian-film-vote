import React from "react";

import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

interface LoadingBarProps {
  status: number;
}

export function LoadingBar({ status }: LoadingBarProps) {
  return (
    <Box
      backgroundColor="green.500"
      as={motion.div}
      height="1"
      w={`${status}%`}
      position="fixed"
      left={0}
      top={0}
      transition="0.1s linear"
    />
  );
}
