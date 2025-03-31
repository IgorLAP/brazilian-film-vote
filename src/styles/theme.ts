import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  globalCss: {
    body: {
      bg: "gray.950",
      color: "white",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Roboto', sans-serif` },
        body: { value: `'Roboto', sans-serif` },
      },
    },
  },
});
