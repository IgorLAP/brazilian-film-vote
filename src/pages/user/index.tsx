import React, { useContext, useState } from "react";

import {
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { CustomButton } from "~/components/CustomButton";
import { MovieDetail } from "~/components/MovieDetail";
import AuthContext from "~/contexts/AuthContext";
import { LoadingContext } from "~/contexts/LoadingContext";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { Movie } from "~/interfaces/Movie";
import { db as adminDb, auth } from "~/lib/firebase-admin";
import { tmdbApi } from "~/lib/tmdb";

interface ShowMovieList extends Movie {
  director: string;
  poster_path: string;
  original_title: string;
  release_date: string;
}

interface MyListsProps {
  lists?: {
    name: string;
    decade: string;
    movies: Movie[];
    points: number;
  }[];
}

interface TmdbMovie {
  original_title: string;
  poster_path: string;
  release_date: string;
}

interface TmdbMovieCredit {
  crew: {
    job: "Director";
    name: string;
  }[];
}

export default function MyLists({ lists }: MyListsProps) {
  const { user } = useContext(AuthContext);
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const { isOpen, onClose, onOpen } = useDisclosure();

  const [selectedList, setSelectedList] = useState<ShowMovieList[]>([]);

  async function handleSeeList(movieList: Movie[]) {
    handleLoading(45, 1000);
    try {
      const dirPromises = movieList.map((movie) => {
        if (movie.id === "No ID") {
          return new Promise<{ name: string }>((resolve) => {
            resolve({
              name: movie?.director,
            });
          });
        }
        return tmdbApi
          .get<TmdbMovieCredit>(`movie/${movie.id}/credits`)
          .then((results) =>
            results.data.crew
              .filter((member) => member.job === "Director")
              .pop()
          );
      });
      const posterYearsPromises = movieList.map((movie) => {
        if (movie.id === "No ID") {
          return new Promise<TmdbMovie>((resolve) => {
            resolve({
              original_title: movie.name,
              poster_path: "/images/poster_placeholder.jpg",
              release_date: String(movie?.year),
            });
          });
        }

        return tmdbApi.get<TmdbMovie>(`movie/${movie.id}`).then((results) => ({
          original_title: results.data.original_title,
          poster_path: results.data.poster_path,
          release_date: results.data.release_date,
        }));
      });
      const directors = await Promise.all(dirPromises).then(
        (results) => results
      );
      const posterYears = await Promise.all(posterYearsPromises).then(
        (results) => results
      );
      const moviesWithDirectors = directors.map((item, index) => ({
        director: item?.name,
        id: movieList[index].id,
        name: movieList[index].name,
        points: movieList[index].points,
        poster_path: posterYears[index].poster_path,
        original_title: posterYears[index].original_title,
        release_date: posterYears[index].release_date,
      }));
      setSelectedList(moviesWithDirectors);
      clearLoading();
      onOpen();
    } catch (err) {
      clearLoading();
      showToast("error", err.message);
    }
  }

  async function handleGenerateCSVFile() {
    try {
      const onlyIdAndName = selectedList.map((movie) => ({
        id: movie.id,
        name: movie.original_title,
      }));
      const { data } = await axios.post("/api/csv", {
        list: onlyIdAndName,
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${user.name}_list.csv`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast("error", err.message);
    }
  }

  const posterPathBase = "https://image.tmdb.org/t/p/w185";

  return (
    <>
      <Head>
        <title>Minhas Listas - {user?.name}</title>
      </Head>
      {!lists ? (
        <Heading>Ainda não há listas</Heading>
      ) : (
        <>
          <Heading as="h1">Minhas Listas</Heading>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Década</Th>
                <Th>Nome</Th>
                <Th>Filmes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {lists.map((list) => (
                <Tr key={list.name}>
                  <Td>{list.decade}</Td>
                  <Td>{list.name}</Td>
                  <Td>
                    <CustomButton
                      buttonType="primary"
                      onClick={() => handleSeeList(list.movies)}
                    >
                      Ver Lista
                    </CustomButton>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Modal size="6xl" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader />
              <ModalCloseButton />
              <ModalBody>
                <Grid rowGap="4" gridTemplateColumns="repeat(3, 1fr)">
                  {selectedList.map((movie) => (
                    <Flex
                      p="1"
                      _hover={{ bg: "gray.900" }}
                      borderRadius={6}
                      key={movie.original_title}
                    >
                      <Image
                        boxSize="120px"
                        borderRadius={6}
                        objectFit="cover"
                        objectPosition="top"
                        src={
                          movie.id !== "No ID"
                            ? `${posterPathBase}${movie.poster_path}`
                            : movie.poster_path
                        }
                      />
                      <Flex
                        justify="space-around"
                        align="flex-start"
                        flexDir="column"
                        ml="2"
                      >
                        <Text fontWeight="bold" fontSize="md">
                          {movie.name}
                        </Text>
                        <MovieDetail field="Diretor" value={movie.director} />
                        <MovieDetail
                          field="Ano"
                          value={movie.release_date.split("-")[0]}
                        />
                        <MovieDetail field="Pontos" value={movie.points} />
                      </Flex>
                    </Flex>
                  ))}
                </Grid>
              </ModalBody>
              <ModalFooter>
                <Tooltip
                  bg="black"
                  color="white"
                  placement="top"
                  label="Importe listas de arquivos .csv no Letterboxd"
                >
                  <Button variant="ghost" onClick={handleGenerateCSVFile}>
                    Exportar como CSV
                  </Button>
                </Tooltip>
                <CustomButton mx={3} buttonType="primary" onClick={onClose}>
                  Fechar
                </CustomButton>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async ({ req }) => {
    const { token } = req.cookies;
    const { uid } = await auth.verifyIdToken(token);
    const userListsSnap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("lists")
      .get();

    if (!userListsSnap.empty) {
      const listTypesSnap = await adminDb.collection("list_type").get();
      const formattedData = userListsSnap.docs.map((item, index) => {
        if (
          listTypesSnap.docs[index].id ===
          item.data().id_list_type.path.split("/")[1]
        ) {
          return {
            name: listTypesSnap.docs[index].data().name,
            movies: item.data().movies,
            decade: item.data().id_list_type.path.split("/")[1].split("-")[0],
          };
        }
        return {};
      });
      return {
        props: {
          lists: formattedData,
        },
      };
    }

    return {
      props: {},
    };
  }
);
