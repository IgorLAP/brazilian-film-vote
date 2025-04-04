import React, { useState } from "react";

import { Box, Button } from "@chakra-ui/react";

import { CustomButton } from "~/presentation/components/CustomButton";
import { GLMovie } from "~/presentation/interfaces/Movie";

interface GeneralMovieList extends GLMovie {
  director: string;
  poster_path: string;
  original_title: string;
  release_date: string;
}

interface NumericPaginationProps {
  allPages: number;
  itemsOnPage: number;
  movieList: GeneralMovieList[];
  setPaginationList: React.Dispatch<React.SetStateAction<GeneralMovieList[]>>;
}

export function NumericPagination({
  allPages,
  itemsOnPage,
  movieList,
  setPaginationList,
}: NumericPaginationProps) {
  const [actualPage, setActualPage] = useState(1);

  function handlePrevPage(page: number) {
    setActualPage(page);
    setPaginationList(
      movieList.slice(page * itemsOnPage - itemsOnPage, page * itemsOnPage),
    );
  }

  function handleNextPage(page: number) {
    setActualPage(page);
    setPaginationList(
      movieList.slice(page * itemsOnPage - itemsOnPage, page * itemsOnPage),
    );
  }

  return (
    <Box mx="auto">
      {actualPage - 2 >= 1 && (
        <>
          <Button variant="ghost" onClick={() => handlePrevPage(1)}>
            1
          </Button>
          {actualPage - 2 > 1 && <Button variant="ghost">...</Button>}
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
          {actualPage + 2 < allPages && <Button variant="ghost">...</Button>}
          <Button variant="ghost" onClick={() => handleNextPage(allPages)}>
            {allPages}
          </Button>
        </>
      )}
    </Box>
  );
}
