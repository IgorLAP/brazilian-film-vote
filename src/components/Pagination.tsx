import React from "react";

import { Box, Button } from "@chakra-ui/react";

import { CustomButton } from "./CustomButton";

interface PaginationProps {
  actualPage: number;
  allPages: number;
  handlePrevPage: (index: number) => void;
  handleNextPage: (index: number) => void;
}

export function Pagination({
  actualPage,
  allPages,
  handlePrevPage,
  handleNextPage,
}: PaginationProps) {
  return (
    <Box mx="auto">
      {actualPage - 2 >= 1 && (
        <>
          <Button variant="ghost" onClick={() => handlePrevPage(1)}>
            1
          </Button>
          {actualPage - 2 > 1 && <Button variant="unstyled">...</Button>}
        </>
      )}

      {actualPage - 1 > 0 && (
        <Button variant="ghost" onClick={() => handlePrevPage(actualPage - 1)}>
          {actualPage - 1}
        </Button>
      )}
      <CustomButton buttonType="primary">{actualPage}</CustomButton>
      {actualPage + 1 <= allPages && (
        <Button variant="ghost" onClick={() => handleNextPage(actualPage + 1)}>
          {actualPage + 1}
        </Button>
      )}

      {actualPage + 2 <= allPages && (
        <>
          {actualPage + 2 < allPages && <Button variant="unstyled">...</Button>}
          <Button variant="ghost" onClick={() => handleNextPage(allPages)}>
            {allPages}
          </Button>
        </>
      )}
    </Box>
  );
}
