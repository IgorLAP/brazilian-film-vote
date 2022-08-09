import React, { useContext, useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Heading,
  Image,
  Input,
  ListItem,
  Popover,
  PopoverAnchor,
  PopoverBody,
  PopoverContent,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";

import AuthContext from "~/contexts/AuthContext";
import useDebounce from "~/hooks/useDebounce";
import { Movie } from "~/interfaces/Movie";
import { db as adminDb, firebaseAdmin } from "~/lib/firebase-admin";
import { tmdbApi } from "~/lib/tmdb";

interface VotingProps {
  generalList: {
    idListType: string;
    status: boolean;
  };
}

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

const movieListPlaceholder: Movie[] = [
  { name: "", id: 0, points: 20 },
  { name: "", id: 0, points: 19 },
  { name: "", id: 0, points: 18 },
  { name: "", id: 0, points: 17 },
  { name: "", id: 0, points: 16 },
  { name: "", id: 0, points: 15 },
  { name: "", id: 0, points: 14 },
  { name: "", id: 0, points: 13 },
  { name: "", id: 0, points: 12 },
  { name: "", id: 0, points: 11 },
  { name: "", id: 0, points: 10 },
  { name: "", id: 0, points: 9 },
  { name: "", id: 0, points: 8 },
  { name: "", id: 0, points: 7 },
  { name: "", id: 0, points: 6 },
  { name: "", id: 0, points: 5 },
  { name: "", id: 0, points: 4 },
  { name: "", id: 0, points: 3 },
  { name: "", id: 0, points: 2 },
  { name: "", id: 0, points: 1 },
];

export default function Voting({ generalList }: VotingProps) {
  const { user } = useContext(AuthContext);

  const inputArrayRef = useRef<HTMLInputElement[]>();
  const checkboxArrayRef = useRef<HTMLInputElement>();

  const [movieList, setMovieList] = useState(movieListPlaceholder);
  const [hasResults, setHasResults] = useState(false);
  const [tmdbList, setTmdbList] = useState<TmdbList[]>([]);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const isFullList = movieList.every(
    (movie) => movie.id !== 0 && movie.name !== ""
  );
  const votingDecade = Number(
    generalList.idListType.split("/")[1].split("-")[0]
  );
  const posterPathBase = "https://image.tmdb.org/t/p/w92";

  function handleMovieChange(movie: string, id: number, index: number) {
    const tmp = [...movieList];
    const alreadyHasMovie = tmp.filter((item) => item.name === movie);
    if (alreadyHasMovie.length > 0) {
      alert("Filme já adicionado");
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
    setHasResults(false);
    setTmdbList([]);
  }

  async function handleSearch(inputValue: string, index: number) {
    if (!inputValue || !inputValue.trim()) {
      setHasResults(false);
      setTmdbList([]);
      setMovieList((prevState) => {
        const tmp = [...prevState];
        tmp[index].name = "";
        return tmp;
      });
    }

    setMovieList((prevState) => {
      const tmp = [...prevState];
      tmp[index].name = inputValue;
      if (tmp[index].id) tmp[index].id = 0;
      return tmp;
    });
    setSearch(inputValue);
  }

  async function tmdbSearch(query: string) {
    const { data } = await tmdbApi.get<TmdbSearch>("", {
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
    }
  }

  useEffect(() => {
    if (search) tmdbSearch(debouncedSearch);
  }, [debouncedSearch]);

  function handleNotFoundMovie(index: number) {
    setMovieList((prevState) => {
      const tmp = [...prevState];
      tmp[index].id = "No ID";
      return tmp;
    });
  }

  return (
    <>
      <Head>
        <title>
          Votação dos anos {votingDecade} - {user?.name.split(" ")[0]}
        </title>
      </Head>
      <Heading as="h1">Votação dos anos {votingDecade}</Heading>
      <Stack my="2" spacing="2">
        <Text color="red.600" fontSize="sm" textAlign="start">
          Após digitar, confirme o voto clicando no filme escolhido
        </Text>
        <Text color="red.600" fontSize="sm" textAlign="start">
          Para um filme não encontrado pela plataforma, primeiro digite e depois
          marque a opção abaixo
        </Text>
      </Stack>
      <Flex
        flexDir="column"
        bg="gray.800"
        pb="4"
        pt="8"
        px="2"
        borderRadius={6}
        mt="2"
      >
        <Grid
          templateColumns="repeat(4, 1fr)"
          columnGap="2"
          rowGap="4"
          mx="auto"
        >
          {movieList.map((movie, index) => {
            const hasId = movieList[index].id;
            const hasName = !!movieList[index].name;
            const isDefaultId = movieList[index].id === 0;
            const isNotFoundMovie = movieList[index].id === "No ID";
            return (
              <Popover
                isOpen={hasName && isDefaultId}
                key={movie.points}
                initialFocusRef={inputArrayRef[index]}
              >
                <PopoverAnchor>
                  <Box>
                    <Input
                      type="text"
                      bg="gray.900"
                      position="relative"
                      placeholder={`${index + 1}º`}
                      ref={inputArrayRef[index]}
                      value={movieList[index].name}
                      borderColor={hasId && hasName ? "green.500" : "inherit"}
                      _hover={{
                        borderColor:
                          hasId && hasName ? "green.400" : "gray.600",
                      }}
                      onChange={(e) => handleSearch(e.target.value, index)}
                      onFocus={() => {
                        if (hasResults) setHasResults(false);
                      }}
                    />
                    <Checkbox
                      size="sm"
                      mt="2"
                      disabled={!isDefaultId && !isNotFoundMovie}
                      isChecked={hasName && isNotFoundMovie}
                      onChange={() => handleNotFoundMovie(index)}
                      ref={checkboxArrayRef}
                    >
                      <Text fontSize="smaller">Filme não encontrado</Text>
                    </Checkbox>
                  </Box>
                </PopoverAnchor>
                {hasResults && (
                  <PopoverContent h="fit-content" w="fit-content">
                    <PopoverBody>
                      <UnorderedList
                        display="flex"
                        flexDir="column"
                        listStyleType="none"
                      >
                        <Stack
                          spacing="4"
                          h="150px"
                          overflow="auto"
                          scrollBehavior="smooth"
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
                                mr="2"
                                variant="unstyled"
                                display="flex"
                                justifyContent="flex-start"
                                onClick={() =>
                                  handleMovieChange(
                                    result.title,
                                    result.id,
                                    index
                                  )
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
                                {result.title}
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
        <Button
          bg="blue.500"
          mt="4"
          mr="6"
          alignSelf="flex-end"
          _hover={{ bg: "blue.600" }}
          disabled={!isFullList}
        >
          Votar
        </Button>
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { token } = req.cookies;
  const generalListRef = adminDb
    .collection("general_list")
    .where("status", "==", true);

  if ((await generalListRef.get()).empty) {
    return {
      redirect: {
        destination: "/user",
        permanent: false,
      },
    };
  }

  const [actualGeneralList] = (await generalListRef.get()).docs;
  const generalList = {
    idListType: actualGeneralList.data().id_list_type.path,
    status: actualGeneralList.data().status,
  };

  const { uid } = await firebaseAdmin.auth().verifyIdToken(token);
  const user = (await adminDb.collection("users").doc(uid).get()).data();
  await firebaseAdmin.auth().updateUser(uid, {
    displayName: user.name,
  });

  return {
    props: {
      generalList,
    },
  };
};