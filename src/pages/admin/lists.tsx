import React, { useState } from "react";

import {
  Button,
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
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { db as webDb } from "~/lib/firebase";
import { db as adminDb } from "~/lib/firebase-admin";

interface Movies {
  name: string;
  points: number;
}
interface ListsProps {
  generalList: {
    idListType: string;
    movies: Movies[];
    status: boolean;
  }[];
}

export default function Lists({ generalList }: ListsProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMovieList, setModalMovieList] = useState<Movies[]>();
  const [gList, setGList] = useState(generalList);

  function handleSeeList(movies: Movies[]) {
    onOpen();
    const orderedByPoints = movies.sort((a, b) => b.points - a.points);
    setModalMovieList(orderedByPoints);
  }

  async function handleFinishList(idListType: string) {
    try {
      const generalListDocRef = doc(
        webDb,
        "general_list",
        idListType.split("/")[1] as string
      );
      updateDoc(generalListDocRef, {
        status: false,
      });
      setGList((prevState) => {
        const index = prevState.findIndex(
          (movie) => movie.idListType === idListType
        );
        const tmp = [...prevState];
        tmp[index].status = false;
        return tmp;
      });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Filmes</Th>
            <Th>Ativa</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {gList.map((list) => (
            <Tr key={list.idListType}>
              <Td>{list.idListType}</Td>
              <Td>
                <Button onClick={() => handleSeeList(list.movies)}>
                  Ver lista
                </Button>
              </Td>
              <Td>{list.status ? "Ativo" : "Finalizado"}</Td>
              <Td>
                {list.status ? (
                  <Button
                    bg="red.500"
                    _hover={{ bg: "red.600" }}
                    onClick={() => handleFinishList(list.idListType)}
                  >
                    Finalizar
                  </Button>
                ) : (
                  <Button
                    bg="blue.500"
                    _hover={{ bg: "blue.600" }}
                    onClick={() => router.push("/list/:id")}
                  >
                    Resultado
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filmes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Pontos</Th>
                </Tr>
              </Thead>
              <Tbody>
                {modalMovieList &&
                  modalMovieList.map((movie) => (
                    <Tr key={movie.name}>
                      <Td>{movie.name}</Td>
                      <Td>{movie.points}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const generalListRef = adminDb.collection("general_list");
  const generalListSnap = await generalListRef.get();
  const generalList = generalListSnap.docs.map((list) => ({
    idListType: list.data().id_list_type.path,
    movies: list.data().movies,
    status: list.data().status,
  }));

  return {
    props: {
      generalList,
    },
  };
};
