import React, { useContext } from "react";

import { Button, Flex, Grid, Image, Text, Tooltip } from "@chakra-ui/react";
import axios from "axios";

import { Modal } from "~/components/Modal";
import AuthContext from "~/contexts/AuthContext";
import { showToast } from "~/helpers/showToast";
import { ShowMovie } from "~/interfaces/Movie";

import { MovieDetail } from "../MovieDetail";

interface PersonalListModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieList: ShowMovie[];
}

export function PersonalListModal({
  isOpen,
  onClose,
  movieList,
}: PersonalListModalProps) {
  const { user } = useContext(AuthContext);

  async function handleGenerateCSVFile() {
    try {
      const onlyIdAndName = movieList.map((movie) => ({
        id: movie.id,
        name: movie.original_title,
      }));
      const { data } = await axios.post("/api/csv", {
        list: onlyIdAndName,
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${user.name.trim().replaceAll(" ", "_")}_list.csv`
      );
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast("error", err.message);
    }
  }

  const posterPathBase = "https://image.tmdb.org/t/p/w185";

  return (
    <Modal
      size={{ base: "lg", md: "3xl", lg: "6xl" }}
      isOpen={isOpen}
      onClose={onClose}
      bodyChildren={
        <Grid
          rowGap="4"
          gridTemplateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
        >
          {movieList.map((movie) => (
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
                  value={movie.release_date.split("-")[0]}
                />
                <MovieDetail field="Pontos" value={movie.points} />
              </Flex>
            </Flex>
          ))}
        </Grid>
      }
      footerChildren={
        <Tooltip
          bg="black"
          color="white"
          placement="top"
          label="Importe listas de arquivos .csv no Letterboxd"
        >
          <Button
            size={{ base: "xs", sm: "sm", md: "md" }}
            variant="solid"
            bg="blue.500"
            _hover={{ bg: "blue.600" }}
            onClick={handleGenerateCSVFile}
          >
            Exportar como CSV
          </Button>
        </Tooltip>
      }
    />
  );
}
