import React, { useState } from "react";

import { Button, Table as ChakraTable, useDisclosure } from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

import { Modal } from "~/presentation/components/Modal";
import { Table } from "~/presentation/components/Table";
import { showAlert } from "~/presentation/helpers/showAlert";
import { useToast } from "~/presentation/hooks/useToast";
import { ExhibitGeneralListI } from "~/presentation/interfaces/GeneralList";
import { Movie } from "~/presentation/interfaces/Movie";
import { webDb } from "~/presentation/lib/firebase";

import { CustomButton } from "../CustomButton";

interface ManageMovieListsProps {
  gList: ExhibitGeneralListI[];
  setGList: React.Dispatch<React.SetStateAction<ExhibitGeneralListI[]>>;
}

export function ManageMovieLists({ gList, setGList }: ManageMovieListsProps) {
  const router = useRouter();

  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [modalMovieList, setModalMovieList] = useState<Movie[]>();

  function handleSeeList(movies: Movie[]) {
    onOpen();
    const orderedByPoints = movies.sort((a, b) => b.points - a.points);
    setModalMovieList(orderedByPoints);
  }

  async function handleFinishList(idListType: string) {
    const { isConfirmed } = await showAlert({
      title: "Confirmar ação",
      text: `Finalizar a votação ${idListType.split("/")[1]}?`,
    });
    if (!isConfirmed) return;
    try {
      const generalListDocRef = doc(
        webDb,
        "general_list",
        idListType.split("/")[1] as string,
      );
      updateDoc(generalListDocRef, {
        status: false,
      });
      setGList((prevState) => {
        const index = prevState.findIndex(
          (movie) => movie.idListType === idListType,
        );
        const tmp = [...prevState];
        tmp[index].status = false;
        return tmp;
      });
    } catch (err) {
      toast("error", err.message);
    }
  }

  return (
    <>
      <Table
        my="8"
        striped
        tableHeaders={["ID", "Filmes", "Status", "Visualizar"]}
      >
        {gList.map((list) => (
          <ChakraTable.Row key={list.idListType}>
            <ChakraTable.ColumnHeader>
              {list.idListType.split("/")[1]}
            </ChakraTable.ColumnHeader>
            <ChakraTable.ColumnHeader>
              <Button
                variant="ghost"
                onClick={() => handleSeeList(list.movies)}
              >
                Top 10
              </Button>
            </ChakraTable.ColumnHeader>
            <ChakraTable.ColumnHeader>
              {list.status ? "Ativo" : "Finalizado"}
            </ChakraTable.ColumnHeader>
            <ChakraTable.ColumnHeader>
              {list.status ? (
                <CustomButton
                  buttonType="danger"
                  onClick={() => handleFinishList(list.idListType)}
                >
                  Finalizar
                </CustomButton>
              ) : (
                <CustomButton
                  buttonType="primary"
                  onClick={() =>
                    router.push(`/list/${list.idListType.split("/")[1]}`)
                  }
                >
                  Lista
                </CustomButton>
              )}
            </ChakraTable.ColumnHeader>
          </ChakraTable.Row>
        ))}
      </Table>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        bodyChildren={
          <Table striped tableHeaders={["Nome", "Pontos"]}>
            {modalMovieList &&
              modalMovieList.slice(0, 10).map((movie) => (
                <ChakraTable.Row key={movie.name}>
                  <ChakraTable.ColumnHeader>
                    {movie.name}
                  </ChakraTable.ColumnHeader>
                  <ChakraTable.ColumnHeader>
                    {movie.points}
                  </ChakraTable.ColumnHeader>
                </ChakraTable.Row>
              ))}
          </Table>
        }
      />
    </>
  );
}
