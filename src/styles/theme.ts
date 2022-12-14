import { ChakraTheme, extendTheme } from "@chakra-ui/react";

const customTheme: Partial<ChakraTheme> = {
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "Roboto",
    body: "Roboto",
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "gray.50",
      },
    },
  },
};

export const theme = extendTheme(customTheme);
