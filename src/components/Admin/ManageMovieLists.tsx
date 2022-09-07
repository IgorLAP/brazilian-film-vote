import React, { useState } from "react";

import { Button, Td, Tr, useDisclosure } from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

import { Modal } from "~/components/Modal";
import { Table } from "~/components/Table";
import { showAlert } from "~/helpers/showAlert";
import { useToast } from "~/hooks/useToast";
import { ExhibitGeneralListI } from "~/interfaces/GeneralList";
import { Movie } from "~/interfaces/Movie";
import { webDb } from "~/lib/firebase";

import { CustomButton } from "../CustomButton";

interface ManageMovieListsProps {
  gList: ExhibitGeneralListI[];
  setGList: React.Dispatch<React.SetStateAction<ExhibitGeneralListI[]>>;
}

export function ManageMovieLists({ gList, setGList }: ManageMovieListsProps) {
  const router = useRouter();

  const { isOpen, onOpen, onClose } = useDisclosure();
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
      toast("error", err.message);
    }
  }

  return (
    <>
      <Table
        my="8"
        variant="striped"
        tableHeaders={["ID", "Filmes", "Status", "Visualizar"]}
      >
        {gList.map((list) => (
          <Tr key={list.idListType}>
            <Td>{list.idListType.split("/")[1]}</Td>
            <Td>
              <Button variant="link" onClick={() => handleSeeList(list.movies)}>
                Top 10
              </Button>
            </Td>
            <Td>{list.status ? "Ativo" : "Finalizado"}</Td>
            <Td>
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
            </Td>
          </Tr>
        ))}
      </Table>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        bodyChildren={
          <Table variant="striped" tableHeaders={["Nome", "Pontos"]}>
            {modalMovieList &&
              modalMovieList.slice(0, 10).map((movie) => (
                <Tr key={movie.name}>
                  <Td>{movie.name}</Td>
                  <Td>{movie.points}</Td>
                </Tr>
              ))}
          </Table>
        }
      />
    </>
  );
}
