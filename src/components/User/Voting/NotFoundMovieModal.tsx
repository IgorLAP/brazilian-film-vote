import React from "react";

import { Box, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";

import { CustomButton } from "~/components/CustomButton";
import { Modal } from "~/components/Modal";
import { Movie } from "~/interfaces/Movie";

interface CompleteNotFoundMovie extends Movie {
  index: number;
}

interface NotFoundMovieProps {
  notFoundMovie: CompleteNotFoundMovie;
  setNotFoundMovie: React.Dispatch<React.SetStateAction<CompleteNotFoundMovie>>;
  movieList: Movie[];
  setMovieList: React.Dispatch<React.SetStateAction<Movie[]>>;
  votingDecade: number;
  isOpen: boolean;
  onClose: () => void;
}

export function NotFoundMovieModal({
  notFoundMovie,
  setNotFoundMovie,
  movieList,
  setMovieList,
  votingDecade,
  isOpen,
  onClose,
}: NotFoundMovieProps) {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerOptions={{ title: "Completar Informações" }}
      bodyChildren={
        <Box mx={{ base: "2", sm: "0" }}>
          <FormControl>
            <FormLabel ml="2">Nome</FormLabel>
            <Input
              type="text"
              bg="gray.900"
              placeholder="Nome"
              mx="auto"
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
          <Flex
            justify="center"
            align="center"
            flexDir={{ base: "column", md: "row" }}
          >
            <FormControl mb={{ base: "4", md: "0" }}>
              <FormLabel ml="2">Ano</FormLabel>
              <Input
                w={{ base: "100%", md: "150" }}
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
          </Flex>
        </Box>
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
  );
}
