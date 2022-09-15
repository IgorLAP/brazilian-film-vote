import React from "react";

import { Flex, Grid, Image, Stack, Text } from "@chakra-ui/react";

import { NumericPagination } from "~/components/List/NumericPagination";
import { MovieDetail } from "~/components/MovieDetail";
import { GLMovie } from "~/interfaces/Movie";

interface GeneralMovieList extends GLMovie {
  director: string;
  poster_path: string;
  original_title: string;
  release_date: string;
}

interface GeneralMovieListProps {
  paginationList: GeneralMovieList[];
  movieList: GeneralMovieList[];
  allPages: number;
  itemsOnPage: number;
  setPaginationList: React.Dispatch<React.SetStateAction<GeneralMovieList[]>>;
}

export function GeneralMovieList({
  paginationList,
  allPages,
  movieList,
  itemsOnPage,
  setPaginationList,
}: GeneralMovieListProps) {
  const posterPathBase = "https://image.tmdb.org/t/p/w185";

  return (
    <>
      <Grid
        my="6"
        mx={{ base: "4", xl: "0" }}
        rowGap={{ base: "6", lg: "4" }}
        columnGap="4"
        gridTemplateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          xl: itemsOnPage === 21 ? "repeat(3,1fr)" : "",
        }}
      >
        {paginationList.map((movie) => (
          <Flex justify="center" align="flex-start" key={movie.original_title}>
            <Image
              h={{ base: "180px", md: "200px", lg: "210px" }}
              w={{ base: "120px", lg: "140px" }}
              src={
                movie.id === "No ID"
                  ? movie.poster_path
                  : posterPathBase + movie.poster_path
              }
              objectFit="cover"
              objectPosition="center"
              borderRadius={6}
              border="2px"
              borderColor="blue.500"
              mr="2"
            />
            <Flex flex="1" flexDir="column" justify="center" align="flex-start">
              <Stack
                h={{ base: "220", md: "320" }}
                overflowY="scroll"
                css={{
                  "&::-webkit-scrollbar": {
                    width: "3px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(48, 130, 206, .4)",
                    borderRadius: "12px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "rgba(48, 130, 206, .7)",
                  },
                }}
                display="flex"
                alignItems="flex-start"
                spacing="2"
              >
                <MovieDetail field="Título" value={movie.name} />
                <MovieDetail field="Pontos" value={movie.points} />
                <MovieDetail field="Diretor" value={movie.director} />
                <MovieDetail
                  field="Ano"
                  value={movie.year ?? movie.release_date.split("-")[0]}
                />
                {movie.voters
                  .sort(
                    (a, b) => Number(a.place.at(-1)) - Number(b.place.at(-1))
                  )
                  .map((voter) => (
                    <Text
                      fontSize={{ base: "small", md: "sm", lg: "md" }}
                      letterSpacing="wide"
                      key={`${voter.name[0]}`}
                    >
                      {voter.place}: {voter.name.join(", ")}
                    </Text>
                  ))}
              </Stack>
            </Flex>
          </Flex>
        ))}
      </Grid>
      <NumericPagination
        itemsOnPage={itemsOnPage}
        movieList={movieList}
        allPages={allPages}
        setPaginationList={setPaginationList}
      />
    </>
  );
}
