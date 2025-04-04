import React from "react";

import { Flex, FlexProps, Heading, Text } from "@chakra-ui/react";

export function MainLogo(props: FlexProps) {
  return (
    <Flex
      flexDir="column"
      align={{ base: "center", md: "flex-end" }}
      justify="center"
      h={{ base: "100%", md: "inherit" }}
      mr={{ base: "0", md: "4" }}
      {...props}
    >
      <Heading textAlign="center" fontSize={["2.2rem", "5xl"]} as="h1">
        <Text as="span" fontSize="4xl">
          🎬
        </Text>
        <Text color="green.500" as="span">
          b
        </Text>
        <Text color="yellow.500" as="span">
          r
        </Text>
        azilian film vote
      </Heading>
      <Text
        mt={{ base: "0", md: "2" }}
        w={{ base: "70%", lg: "100%" }}
        textAlign={{ base: "center", md: "end" }}
        fontSize={["lg"]}
      >
        Faça login na plataforma para eleger os melhores filmes junto à
        cinfefilia brasileira
      </Text>
    </Flex>
  );
}
