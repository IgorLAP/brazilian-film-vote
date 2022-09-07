import React, { useState } from "react";

import {
  Button,
  Flex,
  Grid,
  Icon,
  Image,
  Spinner,
  Td,
  Text,
  Tr,
} from "@chakra-ui/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import { Modal } from "~/components/Modal";
import { MovieDetail } from "~/components/MovieDetail";
import { Table } from "~/components/Table";
import { useToast } from "~/hooks/useToast";
import { GeneralListI } from "~/interfaces/GeneralList";
import { Movie, ShowMovie } from "~/interfaces/Movie";
import { TmdbMovie, TmdbMovieCredit } from "~/interfaces/Tmdb";
import { tmdbApi } from "~/lib/tmdb";

interface UserList extends Omit<GeneralListI, "movies"> {
  movies?: Movie[];
}

interface UserListModalProps {
  modalList: UserList[];
  isOpen: boolean;
  onClose: () => void;
}

export function UserListModal({
  modalList,
  isOpen,
  onClose,
}: UserListModalProps) {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<ShowMovie[]>([]);

  async function handleDisplayList(movieList: Movie[]) {
    setLoading(true);
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
    } catch (err) {
      toast("error", err.message);
    }
    setLoading(false);
  }

  const posterPathBase = "https://image.tmdb.org/t/p/w185";

  return (
    <Modal
      size={
        selectedList.length > 0 ? { base: "lg", md: "3xl", lg: "6xl" } : "xs"
      }
      isOpen={isOpen}
      onClose={onClose}
      bodyChildren={
        <>
          {selectedList.length <= 0 && !loading && (
            <Table variant="simple" tableHeaders={["ID", "Visualizar"]}>
              {modalList.map((list) => (
                <Tr key={list.idListType?.path.split("/")[1]}>
                  <Td>{list.idListType.path.split("/")[1]}</Td>
                  <Td>
                    <Button
                      onClick={() => handleDisplayList(list.movies)}
                      variant="ghost"
                    >
                      <Icon w={5} h={5} as={IoIosArrowForward} />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
          {selectedList.length > 0 && (
            <>
              <Button
                variant="ghost"
                w={7}
                h={7}
                mb="2"
                size="xs"
                onClick={() => setSelectedList([])}
              >
                <Icon w={5} h={5} as={IoIosArrowBack} />
              </Button>
              <Grid
                rowGap="4"
                gridTemplateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
              >
                {selectedList.map((movie) => (
                  <Flex
                    p="1"
                    _hover={{ bg: "gray.900" }}
                    borderRadius={6}
                    key={movie.original_title}
                  >
                    <Image
                      boxSize={{ base: "90px", md: "120px" }}
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
                      flex="1"
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
                        value={movie.release_date?.split("-")[0]}
                      />
                      <MovieDetail field="Pontos" value={movie.points} />
                    </Flex>
                  </Flex>
                ))}
              </Grid>
            </>
          )}
          {loading && (
            <Flex justify="center" align="center">
              <Spinner size="lg" mt="4" color="blue.500" />
            </Flex>
          )}
        </>
      }
    />
  );
}
