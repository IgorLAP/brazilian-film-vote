import React, { useState, useEffect, useRef } from "react";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Image,
  Input,
  ListItem,
  Popover,
  PopoverAnchor,
  PopoverBody,
  PopoverContent,
  Spinner,
  Stack,
  Text,
  UnorderedList,
  useBreakpointValue,
} from "@chakra-ui/react";

import { showToast } from "~/helpers/showToast";
import useDebounce from "~/hooks/useDebounce";
import { Movie } from "~/interfaces/Movie";
import { tmdbApi } from "~/lib/tmdb";

interface TmdbList {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  genre_ids: number[];
}

interface TmdbSearch {
  page: number;
  results: TmdbList[];
}

interface VotingGridProps {
  movieList: Movie[];
  setMovieList: React.Dispatch<React.SetStateAction<Movie[]>>;
  votingDecade: number;
  handleNotFoundMovie: (inputValue: string, index: number) => void;
}

export function VotingGrid({
  movieList,
  votingDecade,
  setMovieList,
  handleNotFoundMovie,
}: VotingGridProps) {
  const responsiveToast = useBreakpointValue({
    base: true,
    sm: false,
  });

  const inputArrayRef = useRef<HTMLInputElement[]>();
  const checkboxArrayRef = useRef<HTMLInputElement>();

  const [search, setSearch] = useState("");
  const [hasResults, setHasResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tmdbList, setTmdbList] = useState<TmdbList[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (search) tmdbSearch(debouncedSearch);
  }, [debouncedSearch]);

  async function tmdbSearch(query: string) {
    const { data } = await tmdbApi.get<TmdbSearch>("search/movie", {
      params: { query },
    });
    const filterByDecade = data.results.filter(
      (movie) =>
        Number(movie.release_date?.split("-")[0]) >= votingDecade &&
        Number(movie.release_date?.split("-")[0]) <= votingDecade + 9
    );
    if (filterByDecade.length > 0) {
      setTmdbList(filterByDecade);
      setHasResults(true);
    } else {
      showToast("error", "Nenhum resultado encontrado", responsiveToast);
      setHasResults(false);
      setTmdbList([]);
    }
    setLoading(false);
  }

  async function handleSearch(inputValue: string, index: number) {
    setLoading(true);
    if (!inputValue || !inputValue.trim()) {
      setHasResults(false);
      setTmdbList([]);
      setMovieList((prevState) => {
        const tmp = [...prevState];
        tmp[index].name = "";
        tmp[index].id = 0;
        if (tmp[index].director) {
          delete tmp[index].director;
          delete tmp[index].year;
        }
        return tmp;
      });
      setLoading(false);
    }

    setMovieList((prevState) => {
      const tmp = [...prevState];
      tmp[index].name = inputValue;
      if (tmp[index].id) tmp[index].id = 0;
      return tmp;
    });
    setSearch(inputValue);
  }

  function handleMovieChange(movie: string, id: number, index: number) {
    const tmp = [...movieList];
    const alreadyHasMovie = tmp.filter(
      (item) => item.name === movie && item.id === id
    );
    if (alreadyHasMovie.length > 0) {
      showToast("warn", "Filme já adicionado");
      setMovieList(() => {
        tmp[index].name = "";
        tmp[index].id = 0;
        return tmp;
      });
    } else {
      setMovieList(() => {
        tmp[index].name = movie;
        tmp[index].id = id;
        return tmp;
      });
    }
    setSearch("");
    setHasResults(false);
    setTmdbList([]);
  }

  const posterPathBase = "https://image.tmdb.org/t/p/w92";

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        sm: "1fr 1fr",
        md: "repeat(3, 1fr)",
        lg: "repeat(4, 1fr)",
      }}
      columnGap={{ base: "8", sm: "12", md: "4" }}
      rowGap={{ base: "6", md: "4" }}
      mx="auto"
    >
      {movieList.map((movie, index) => {
        const hasId = movieList[index].id;
        const hasName = !!movieList[index].name;
        const isDefaultId = movieList[index].id === 0;
        const isNotFoundMovie = movieList[index].id === "No ID";
        const waitResetDebounce = debouncedSearch !== "" && search === "";
        return (
          <Popover
            isOpen={hasName && isDefaultId}
            key={movie.points}
            initialFocusRef={inputArrayRef[index]}
          >
            <PopoverAnchor>
              <Box>
                <Flex align="center">
                  <Input
                    type="text"
                    bg="gray.900"
                    pl="3"
                    pr="6"
                    position="relative"
                    placeholder={`${index + 1}º`}
                    ref={inputArrayRef[index]}
                    value={movieList[index].name}
                    disabled={waitResetDebounce}
                    borderColor={hasId && hasName ? "green.500" : "inherit"}
                    _hover={{
                      borderColor: hasId && hasName ? "green.400" : "gray.600",
                    }}
                    onChange={(e) => handleSearch(e.target.value, index)}
                    onFocus={() => {
                      if (hasResults) setHasResults(false);
                      let hadClean = false;
                      movieList.forEach((item, i) => {
                        if (
                          item.name !== "" &&
                          (item.id === 0 || item.id === "No ID")
                        ) {
                          if (index !== i) item.name = "";
                          if (!hadClean) hadClean = true;
                        }
                      });
                      if (hadClean && !hasName) setSearch("");
                    }}
                  />
                  <Spinner
                    color="gray.400"
                    zIndex="9"
                    size="xs"
                    ml="-5"
                    display={loading && !hasId && hasName ? "block" : "none"}
                  />
                </Flex>
                <Checkbox
                  size="sm"
                  mt="2"
                  disabled={!isDefaultId && !isNotFoundMovie}
                  isChecked={hasName && isNotFoundMovie}
                  onChange={() => {
                    if (hasName)
                      handleNotFoundMovie(movieList[index].name, index);
                  }}
                  ref={checkboxArrayRef}
                >
                  <Text fontSize="smaller">Filme não encontrado</Text>
                </Checkbox>
              </Box>
            </PopoverAnchor>
            {hasResults && (
              <PopoverContent ml={{ sm: "2" }} h="fit-content" w="fit-content">
                <PopoverBody w={{ base: "280px", sm: "-webkit-fit-content" }}>
                  <UnorderedList
                    display="flex"
                    flexDir="column"
                    listStyleType="none"
                  >
                    <Stack
                      spacing="4"
                      h="150px"
                      overflowY="scroll"
                      overflowX="scroll"
                      scrollBehavior="smooth"
                      pb={{ base: ".5rem", sm: "0" }}
                      css={{
                        "&::-webkit-scrollbar": {
                          width: "3px",
                          height: "3px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "rgb(48, 130, 206)",
                          borderRadius: "12px",
                        },
                      }}
                    >
                      {tmdbList.map((result) => (
                        <ListItem
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          key={result.id}
                          _hover={{ bg: "gray.600" }}
                        >
                          <Button
                            w="100%"
                            h="100%"
                            mr="2"
                            variant="unstyled"
                            display="flex"
                            justifyContent="flex-start"
                            onClick={() =>
                              handleMovieChange(result.title, result.id, index)
                            }
                          >
                            <Image
                              h="45px"
                              w="45px"
                              mr="2"
                              objectFit="cover"
                              objectPosition="center"
                              src={posterPathBase + result.poster_path}
                            />
                            {result.title.length >= 40
                              ? `${result.title.substring(0, 25)}... `
                              : result.title}{" "}
                            - {result.release_date.split("-")[0]}
                          </Button>
                        </ListItem>
                      ))}
                    </Stack>
                  </UnorderedList>
                </PopoverBody>
              </PopoverContent>
            )}
          </Popover>
        );
      })}
    </Grid>
  );
}
