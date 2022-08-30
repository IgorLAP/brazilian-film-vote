import React from "react";

import { Flex, HStack, Text } from "@chakra-ui/react";

interface MovieDetailProps {
  field: string;
  value: string | number;
}

export function MovieDetail({ field, value }: MovieDetailProps) {
  return (
    <Flex justify="center" align="center">
      <HStack spacing="1">
        <Text fontWeight="medium" fontSize="medium">
          {field}:
        </Text>
        <Text fontWeight="light" fontSize="md">
          {value}
        </Text>
      </HStack>
    </Flex>
  );
}
