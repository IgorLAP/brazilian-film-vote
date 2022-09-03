import React from "react";

import { Flex, Heading, HTMLChakraProps, Text } from "@chakra-ui/react";

export function LogoHome(props: HTMLChakraProps<"div">) {
  return (
    <Flex
      {...props}
      flexDir="column"
      align={{ base: "center", md: "flex-end" }}
      justify={{ base: "flex-end", md: "inherit" }}
      h={{ base: "100%", md: "inherit" }}
      mr={{ base: "0", md: "4" }}
      mb={{ base: "10" }}
    >
      <Heading textAlign="center" fontSize={["4xl", "5xl"]} as="h1">
        🎬
        <Text color="green.500" as="span">
          b
        </Text>
        <Text color="yellow.500" as="span">
          r
        </Text>
        azilian film vote
      </Heading>
      <Text
        mt="2"
        w={{ base: "80%", lg: "100%" }}
        textAlign={{ base: "center", md: "end" }}
        fontSize={{ base: "md", md: "lg" }}
      >
        Faça login na plataforma para eleger os melhores filmes junto à
        cinfefilia brasileira
      </Text>
    </Flex>
  );
}
