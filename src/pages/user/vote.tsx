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
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { CustomButton } from "~/components/CustomButton";
import AuthContext from "~/contexts/AuthContext";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import useDebounce from "~/hooks/useDebounce";
import { Movie } from "~/interfaces/Movie";
import { db as webDb } from "~/lib/firebase";
import { db as adminDb, auth } from "~/lib/firebase-admin";
import { tmdbApi } from "~/lib/tmdb";
import { GeneralList } from "~/models/GeneralList";

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
  const router = useRouter();

  const { user } = useContext(AuthContext);

  const inputArrayRef = useRef<HTMLInputElement[]>();
  const checkboxArrayRef = useRef<HTMLInputElement>();

  const [movieList, setMovieList] = useState(movieListPlaceholder);
  const [hasResults, setHasResults] = useState(false);
  const [tmdbList, setTmdbList] = useState<TmdbList[]>([]);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (search) tmdbSearch(debouncedSearch);
  }, [debouncedSearch]);

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
      showToast("error", "Nenhum resultado encontrado");
      setHasResults(false);
      setTmdbList([]);
    }
  }

  function handleNotFoundMovie(inputValue: string, index: number) {
    const clone = [...movieList];
    clone[index].name = inputValue;
    const alreadyHasMovie = clone.filter(
      (item) => item.name.toLowerCase() === inputValue.toLowerCase()
    );
    if (alreadyHasMovie.length > 1) {
      showToast("warn", "Filme já adicionado");
      setMovieList(() => {
        clone[index].name = "";
        clone[index].id = 0;
        return clone;
      });
    } else {
      setMovieList((prevState) => {
        const tmp = [...prevState];
        tmp[index].id = "No ID";
        return tmp;
      });
    }
  }

  async function handleVote() {
    try {
      const listsCollectionDocRef = doc(
        webDb,
        `users/${user.uid}/lists`,
        generalList.idListType.split("/")[1]
      );
      const generalListCollectionRef = doc(
        webDb,
        "general_list",
        generalList.idListType.split("/")[1]
      );
      await setDoc(listsCollectionDocRef, {
        id_list_type: generalList.idListType,
        movies: movieList,
      });
      const actualGeneral = await getDoc(generalListCollectionRef);
      if (actualGeneral.exists) {
        const { movies } = actualGeneral.data();
        const cloneMovieList = [...movieList];
        Object.keys(movies).forEach((i) => {
          Object.keys(movieList).forEach((y) => {
            if (movies[i].name === cloneMovieList[y].name) {
              movies[i].points += cloneMovieList[y].points;
              cloneMovieList.splice(Number(y), 1);
            }
          });
        });
        const updatedGeneralList = cloneMovieList
          .concat(movies)
          .sort((a, b) => b.points - a.points);
        await updateDoc(generalListCollectionRef, {
          movies: updatedGeneralList,
        });
      } else {
        const listTypeRef = doc(
          webDb,
          "list_type",
          `${generalList.idListType}-0`
        );
        const newGeneralList = new GeneralList({
          idListType: listTypeRef,
          movies: movieList.sort((a, b) => b.points - a.points),
          status: true,
        });
        await setDoc(generalListCollectionRef, { ...newGeneralList });
      }
      router.push("/user");
    } catch (err) {
      showToast("error", err.message);
    }
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
        as="main"
        flexDir="column"
        bg="gray.800"
        pb="4"
        pt="8"
        px="6"
        borderRadius={6}
        mt="2"
      >
        <Grid
          templateColumns="repeat(4, 1fr)"
          columnGap="6"
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
                      onChange={() =>
                        handleNotFoundMovie(movieList[index].name, index)
                      }
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
        <CustomButton
          buttonType="primary"
          mt="4"
          px="6"
          alignSelf="flex-end"
          disabled={!isFullList}
          onClick={handleVote}
        >
          Votar
        </CustomButton>
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async ({ req }) => {
    const { token } = req.cookies;
    const generalListRef = adminDb
      .collection("general_list")
      .where("status", "==", true);
    const isVotingConcluded = (await generalListRef.get()).empty;

    if (isVotingConcluded) {
      return {
        redirect: {
          destination: "/user",
          permanent: false,
        },
      };
    }

    const [activeGList] = (await generalListRef.get()).docs;
    const activeGListId = activeGList.data().id_list_type.path;
    const activeGListStatus = activeGList.data().status;

    const actualGeneralList = {
      idListType: activeGListId,
      status: activeGListStatus,
    };

    const { uid } = await auth.verifyIdToken(token);

    const userActualList = await adminDb
      .collection("users")
      .doc(uid)
      .collection("lists")
      .doc(activeGListId.split("/")[1] as string)
      .get();

    if (userActualList.exists) {
      return {
        redirect: {
          destination: "/user",
          permanent: false,
        },
      };
    }

    const user = (await adminDb.collection("users").doc(uid).get()).data();
    await auth.updateUser(uid, {
      displayName: user.name,
    });

    return {
      props: {
        generalList: actualGeneralList,
      },
    };
  }
);
