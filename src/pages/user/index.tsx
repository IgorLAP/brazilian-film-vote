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

import AuthContext from "~/contexts/AuthContext";
import { Movie } from "~/interfaces/Movie";
import { db as adminDb, firebaseAdmin } from "~/lib/firebase-admin";
import { tmdbApi } from "~/lib/tmdb";

interface movieWithDirector extends Movie {
  director: string;
}

interface MyListsProps {
  lists?: {
    name: string;
    id_list_type: string;
    movies: Movie[];
    points: number;
  }[];
}

export default function MyLists({ lists }: MyListsProps) {
  const { user } = useContext(AuthContext);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [selectedList, setSelectedList] = useState<movieWithDirector[]>([]);

  async function handleSeeList(movieList: Movie[]) {
    const dirPromises = movieList.map((movie) =>
      tmdbApi
        .get(`movie/${movie.id}/credits`)
        .then((results) =>
          results.data.crew.filter((member) => member.job === "Director").pop()
        )
        .catch((err) => console.log(err))
    );
    const directors = await Promise.all(dirPromises).then((results) => results);
    const moviesWithDirectors = directors.map((item, index) => ({
      director: item.name as string,
      id: movieList[index].id,
      name: movieList[index].name,
      points: movieList[index].points,
    }));
    setSelectedList(moviesWithDirectors);
    onOpen();
  }

  async function handleGenerateCSVFile() {
    try {
      const onlyIdAndName = selectedList.map((movie) => ({
        id: movie.id,
        name: movie.name,
      }));
      const { data } = await axios.post("/api/csv", {
        list: onlyIdAndName,
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "file.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.log(err);
    }
  }

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
                <Th>ID</Th>
                <Th>Nome</Th>
                <Th>Filmes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {lists.map((list) => (
                <Tr key={list.id_list_type}>
                  <Td>{list.id_list_type.split("/")[1]}</Td>
                  <Td>{list.name}</Td>
                  <Td>
                    <Button
                      onClick={() => handleSeeList(list.movies)}
                      bg="blue.500"
                      _hover={{ bg: "blue.600" }}
                    >
                      Ver Lista
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Modal size="6xl" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Lista</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Grid gridTemplateColumns="repeat(4, 1fr)">
                  {selectedList.map((movie) => (
                    <Flex
                      key={movie.id}
                      justify="center"
                      align="center"
                      flexDir="column"
                    >
                      <Text>{movie.name}</Text>
                      <Flex>
                        <Text fontWeight="bold" fontSize="small">
                          Diretor:
                        </Text>
                        <Text>{movie.director}</Text>
                      </Flex>
                      <Flex>
                        <Text fontWeight="bold" fontSize="small">
                          Pontos:
                        </Text>
                        <Text>{movie.points}</Text>
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
                  label="Importe listas de arquivos .CSV no letterboxd"
                >
                  <Button variant="ghost" onClick={handleGenerateCSVFile}>
                    Exportar como CSV
                  </Button>
                </Tooltip>
                <Button
                  mx={3}
                  bg="blue.500"
                  _hover={{ bg: "blue.600" }}
                  onClick={onClose}
                >
                  Fechar
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { token } = req.cookies;
  const { uid } = await firebaseAdmin.auth().verifyIdToken(token);
  const userListsSnap = await adminDb
    .collection("users")
    .doc(uid)
    .collection("lists")
    .get();

  if (!userListsSnap.empty) {
    const listTypesSnap = await adminDb.collection("list_type").get();
    const formattedData = userListsSnap.docs.map((item, index) => {
      if (
        listTypesSnap.docs[index].id === item.data().id_list_type.split("/")[1]
      ) {
        return {
          name: listTypesSnap.docs[index].data().name,
          movies: item.data().movies,
          id_list_type: item.data().id_list_type,
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
    props: {
      // lists: userListsSnap.docs.map((list) => list.data()),
    },
  };
};
