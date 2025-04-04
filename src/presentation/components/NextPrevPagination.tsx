import React from "react";

import { Button, Flex } from "@chakra-ui/react";

interface NextPrevPaginationProps {
  actualPage: number;
  allPages: number;
  handlePrevPage: () => Promise<void>;
  handleNextPage: () => Promise<void>;
}

export function NextPrevPagination({
  actualPage,
  allPages,
  handleNextPage,
  handlePrevPage,
}: NextPrevPaginationProps) {
  return (
    <Flex justify="space-between" mt="8">
      <Button
        size={{ base: "sm", md: "md" }}
        disabled={!(actualPage > 1)}
        variant="ghost"
        colorScheme="blue"
        onClick={handlePrevPage}
      >
        Voltar
      </Button>
      <Button
        size={{ base: "sm", md: "md" }}
        disabled={!(actualPage < allPages)}
        variant="ghost"
        colorScheme="blue"
        onClick={handleNextPage}
      >
        Avançar
      </Button>
    </Flex>
  );
}
