import React, { useContext, useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  HStack,
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
  useDisclosure,
} from "@chakra-ui/react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { CustomButton } from "~/components/CustomButton";
import { Modal } from "~/components/Modal";
import AuthContext from "~/contexts/AuthContext";
import { LoadingContext } from "~/contexts/LoadingContext";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import useDebounce from "~/hooks/useDebounce";
import { GLMovie, Movie } from "~/interfaces/Movie";
import { fieldName } from "~/interfaces/Voters";
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

interface CompleteNotFoundMovie extends Movie {
  index: number;
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
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const inputArrayRef = useRef<HTMLInputElement[]>();
  const checkboxArrayRef = useRef<HTMLInputElement>();

  const [movieList, setMovieList] = useState(movieListPlaceholder);
  const [hasResults, setHasResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tmdbList, setTmdbList] = useState<TmdbList[]>([]);
  const [search, setSearch] = useState("");
  const [notFoundMovie, setNotFoundMovie] =
    useState<CompleteNotFoundMovie | null>();

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
  const title = `Votação dos anos ${votingDecade} - ${
    user?.name.split(" ")[0]
  }`;

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
    setLoading(false);
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
      setNotFoundMovie({ ...clone[index], index });
      onOpen();
    }
  }

  function handleCompleteNotFoundMovie() {
    const { index } = notFoundMovie;
    setMovieList((prevState) => {
      const tmp = [...prevState];
      tmp[index].id = "No ID";
      tmp[index].director = notFoundMovie.director;
      tmp[index].year = notFoundMovie.year;
      return tmp;
    });
    setNotFoundMovie(null);
    onClose();
  }

  async function handleVote() {
    handleLoading(25, 1000);
    try {
      const userListDocRef = doc(
        webDb,
        `users/${user.uid}/lists`,
        generalList.idListType.split("/")[1]
      );
      const generalListDocRef = doc(
        webDb,
        "general_list",
        generalList.idListType.split("/")[1]
      );
      const listTypeDocRef = doc(
        webDb,
        "list_type",
        `${generalList.idListType.split("/")[1]}`
      );
      await setDoc(userListDocRef, {
        id_list_type: listTypeDocRef,
        movies: movieList,
      });
      const actualGeneral = await getDoc(generalListDocRef);
      if (actualGeneral.data().movies.length > 0) {
        const { movies } = actualGeneral.data();
        const cloneMovieList = [...movieList] as GLMovie[];
        Object.keys(movies).forEach((i) => {
          Object.keys(movieList).forEach((y) => {
            if (movies[i].name === cloneMovieList[y]?.name) {
              movies[i].points += cloneMovieList[y].points;
              const movieListPlace = movieList.findIndex(
                (item) => item.name === cloneMovieList[y]?.name
              );
              movies[i].voters.forEach((voter, voteI) => {
                if (voter.place === `#${movieListPlace + 1}`) {
                  movies[i].voters[voteI].name.push(user.name);
                }
              });
              const alreadyHas = movies[i].voters.filter(
                (item) => item.place === `#${movieListPlace + 1}`
              );
              if (alreadyHas.length <= 0)
                movies[i].voters.push({
                  name: [user.name],
                  place: `#${movieListPlace + 1}`,
                });
              cloneMovieList.splice(Number(y), 1);
            }
          });
        });

        const updatedGeneralList = cloneMovieList
          .concat(movies)
          .map((item, index) => {
            if (!item.voters) {
              return {
                ...item,
                voters: [
                  {
                    name: [user.name],
                    place: `#${index + 1}`,
                  },
                ],
              };
            }
            return {
              ...item,
            };
          });
        await updateDoc(generalListDocRef, {
          movies: updatedGeneralList.sort((a, b) => b.points - a.points),
        });
      } else {
        const movies = movieList
          .sort((a, b) => b.points - a.points)
          .map((item, index) => {
            const response = {
              id: item.id,
              name: item.name,
              points: item.points,
              voters: [
                {
                  name: [`${user.name}`],
                  place: `#${index + 1}` as fieldName,
                },
              ],
            };

            if (!item.director) return response;

            return {
              ...response,
              year: item?.year,
              director: item?.director,
            };
          });
        const newGeneralList = new GeneralList({
          idListType: listTypeDocRef,
          movies,
          status: true,
        });
        await setDoc(generalListDocRef, {
          id_list_type: newGeneralList.idListType,
          movies: newGeneralList.movies,
          status: newGeneralList.status,
        });
      }
      router.push("/user");
    } catch (err) {
      clearLoading();
      showToast("error", err.message);
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
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
          columnGap="4"
          rowGap="4"
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
                          borderColor:
                            hasId && hasName ? "green.400" : "gray.600",
                        }}
                        onChange={(e) => handleSearch(e.target.value, index)}
                        onFocus={() => {
                          if (hasResults) setHasResults(false);
                        }}
                      />
                      <Spinner
                        color="gray.400"
                        zIndex="9"
                        size="xs"
                        ml="-5"
                        display={
                          loading && !hasId && hasName ? "block" : "none"
                        }
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
                          overflowY="scroll"
                          scrollBehavior="smooth"
                          css={{
                            "&::-webkit-scrollbar": {
                              width: "3px",
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        headerOptions={{ title: "Completar Informações" }}
        bodyChildren={
          <>
            <FormControl>
              <FormLabel ml="2">Nome</FormLabel>
              <Input
                type="text"
                bg="gray.900"
                placeholder="Nome"
                mb="4"
                value={notFoundMovie?.name}
                onChange={(e) => {
                  if (e.target.value.length <= 0) return;
                  const clone = [...movieList];
                  const index = clone.findIndex(
                    (movie) => movie.name === notFoundMovie.name
                  );
                  setNotFoundMovie((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                  clone[index].name = e.target.value;
                  setMovieList(clone);
                }}
              />
            </FormControl>
            <HStack spacing="2">
              <FormControl>
                <FormLabel ml="2">Ano</FormLabel>
                <Input
                  w="150"
                  type="text"
                  bg="gray.900"
                  placeholder="Ano"
                  maxLength={4}
                  value={notFoundMovie?.year}
                  onChange={(e) => {
                    if (!Number.isNaN(Number(e.target.value)))
                      setNotFoundMovie((prev) => ({
                        ...prev,
                        year: Number(e.target.value),
                      }));
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel ml="2">Diretor</FormLabel>
                <Input
                  type="text"
                  bg="gray.900"
                  placeholder="Diretor"
                  value={notFoundMovie?.director}
                  onChange={(e) =>
                    setNotFoundMovie((prev) => ({
                      ...prev,
                      director: e.target.value,
                    }))
                  }
                />
              </FormControl>
            </HStack>
          </>
        }
        footerChildren={
          <CustomButton
            buttonType="primary"
            disabled={
              !String(notFoundMovie?.year).includes(
                String(votingDecade).substring(0, 3)
              ) ||
              String(notFoundMovie?.year).length < 4 ||
              !notFoundMovie.director ||
              !notFoundMovie.name
            }
            onClick={handleCompleteNotFoundMovie}
          >
            Salvar
          </CustomButton>
        }
      />
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
