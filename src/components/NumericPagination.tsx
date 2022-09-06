import React, { useState } from "react";

import { Box, Button } from "@chakra-ui/react";

import { GLMovie } from "~/interfaces/Movie";

import { CustomButton } from "./CustomButton";

interface GeneralMovieList extends GLMovie {
  director: string;
  poster_path: string;
  original_title: string;
  release_date: string;
}

interface NumericPaginationProps {
  allPages: number;
  movieList: GeneralMovieList[];
  setPaginationList: React.Dispatch<React.SetStateAction<GeneralMovieList[]>>;
}

export function NumericPagination({
  allPages,
  movieList,
  setPaginationList,
}: NumericPaginationProps) {
  const [actualPage, setActualPage] = useState(1);

  function handlePrevPage(page: number) {
    setActualPage(page);
    setPaginationList(movieList.slice(page * 24 - 24, page * 24));
  }

  function handleNextPage(page: number) {
    setActualPage(page);
    setPaginationList(movieList.slice(page * 24 - 24, page * 24));
  }

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
      <CustomButton w="fit-content" buttonType="primary">
        {actualPage}
      </CustomButton>
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
