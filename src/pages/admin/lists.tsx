import React, { useContext, useRef, useState } from "react";

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { CustomButton } from "~/components/CustomButton";
import { Modal } from "~/components/Modal";
import { LoadingContext } from "~/contexts/LoadingContext";
import { showAlert } from "~/helpers/showAlert";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { ExhibitGeneralListI } from "~/interfaces/GeneralList";
import { Movie } from "~/interfaces/Movie";
import { db as webDb } from "~/lib/firebase";
import { db as adminDb, db } from "~/lib/firebase-admin";
import { Decades } from "~/models/Decades";
import { GeneralList } from "~/models/GeneralList";
import { ListType } from "~/models/ListType";

interface ListsProps {
  generalList: ExhibitGeneralListI[];
  validDecades: number[];
  pagination: {
    allPages: number;
  };
}

export default function Lists({
  generalList,
  validDecades,
  pagination,
}: ListsProps) {
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const router = useRouter();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const decadeSelectRef = useRef<HTMLSelectElement>();

  const [modalMovieList, setModalMovieList] = useState<Movie[]>();
  const [gList, setGList] = useState(generalList);
  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(false);
  const [actualPage, setActualPage] = useState(1);
  const [firstPageItem, setFirstPageItem] = useState<ExhibitGeneralListI[]>([]);
  const [lastPageItem, setLastPageItem] = useState<ExhibitGeneralListI[]>([]);

  async function handleNewListType() {
    handleLoading(20, 1000);
    const isRequiredFieldsInvalid =
      listName === "" || !decadeSelectRef.current.value;
    const decadeCurrentlyVoting = gList.filter((list) => {
      return (
        list.status &&
        list.idListType.split("/")[1].split("-")[0] ===
          decadeSelectRef.current.value
      );
    });
    try {
      if (isRequiredFieldsInvalid) {
        showToast("error", "Preencha o nome e a década");
        return;
      }

      if (!isRequiredFieldsInvalid && decadeCurrentlyVoting.length > 0) {
        showToast(
          "error",
          `Votação dos anos ${decadeSelectRef.current.value} indisponível`
        );
        decadeSelectRef.current.value = "";
        return;
      }
      const decade = Number(decadeSelectRef.current.value);
      const newListType = new ListType({ name: listName, decade });
      const listTypeDocRef = doc(webDb, "list_type", `${decade}-0`);

      const listTypeExists = (await getDoc(listTypeDocRef)).exists();
      if (listTypeExists) {
        const q = query(
          collection(webDb, "list_type"),
          where("decade", "==", decade)
        );
        const querySnap = await getDocs(q);
        const thisDecadeListTypesIds = querySnap.docs.map((item) => item.id);
        const lastUsedIndex = (thisDecadeListTypesIds.at(-1) as string).split(
          "-"
        )[1];

        const newIndex = Number(lastUsedIndex) + 1;
        await setDoc(doc(webDb, "list_type", `${decade}-${newIndex}`), {
          ...newListType,
        });

        const listTypeRef = doc(webDb, "list_type", `${decade}-${newIndex}`);
        const newGeneralList = new GeneralList({ idListType: listTypeRef });
        await setDoc(doc(webDb, "general_list", `${decade}-${newIndex}`), {
          id_list_type: newGeneralList.idListType,
          movies: newGeneralList.movies,
          status: newGeneralList.status,
        });
        setGList((prevState) => [
          ...prevState,
          {
            ...newGeneralList,
            idListType: newGeneralList.idListType.path,
          },
        ]);
      } else {
        await setDoc(listTypeDocRef, {
          ...newListType,
        });

        const listTypeRef = doc(webDb, "list_type", `${decade}-0`);
        const newGeneralList = new GeneralList({ idListType: listTypeRef });
        await setDoc(doc(webDb, "general_list", `${decade}-0`), {
          id_list_type: newGeneralList.idListType,
          movies: newGeneralList.movies,
          status: newGeneralList.status,
        });

        const tmp = [
          ...gList,
          { ...newGeneralList, idListType: newGeneralList.idListType.path },
        ].sort((a, b) => (b.idListType < a.idListType ? 1 : -1));
        setGList(tmp);
      }
      showToast("success", "Criado com sucesso");
      setListName("");
      decadeSelectRef.current.value = "";
    } catch (err) {
      showToast("error", err.message);
    }
    clearLoading();
  }

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
      showToast("error", err.message);
    }
  }

  async function handleNextPage() {
    try {
      setLoading(true);
      const last = gList.at(-1);
      const { data } = await axios.post("/api/lists-pagination", {
        startAfter: last.idListType.split("/")[1],
      });
      setLastPageItem((prev) => [...prev, gList.at(-1)]);
      setFirstPageItem((prev) => [...prev, gList[0]]);
      setGList(data.page as ExhibitGeneralListI[]);
      setActualPage((prev) => prev + 1);
    } catch (err) {
      showToast("error", "Erro no carregamento");
    }
    setLoading(false);
  }

  async function handlePrevPage() {
    try {
      setLoading(true);
      const firstPageLast = firstPageItem.at(-1).idListType.split("/")[1];
      const lastPageLast = lastPageItem.at(-1).idListType.split("/")[1];
      const { data } = await axios.post("/api/lists-pagination", {
        startAt: firstPageLast,
        endAt: lastPageLast,
      });
      setGList(data.page as ExhibitGeneralListI[]);
      setLastPageItem((prev) =>
        prev.filter((item) => item.idListType.split("/")[1] !== lastPageLast)
      );
      setFirstPageItem((prev) =>
        prev.filter((item) => item.idListType.split("/")[1] !== firstPageLast)
      );
      setActualPage((prev) => prev - 1);
    } catch (err) {
      showToast("error", "Erro no carregamento");
    }
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Listas - Brazilian film vote</title>
      </Head>
      <Flex flexDir="column">
        <Flex
          bg="gray.800"
          py="4"
          px="6"
          mb="4"
          borderRadius={6}
          as="form"
          justify="flex-start"
          align="center"
          alignSelf="flex-start"
        >
          <HStack spacing="4">
            <FormControl>
              <FormLabel>Nome da lista</FormLabel>
              <Input
                bg="gray.900"
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Década</FormLabel>
              <Select ref={decadeSelectRef} bg="gray.900">
                <option value="">Selecione</option>
                {validDecades.map((decadeOpt) => (
                  <option value={decadeOpt} key={decadeOpt}>
                    {decadeOpt}
                  </option>
                ))}
              </Select>
            </FormControl>
            <CustomButton
              alignSelf="flex-end"
              buttonType="primary"
              type="button"
              px={6}
              onClick={handleNewListType}
            >
              Criar
            </CustomButton>
          </HStack>
        </Flex>
        {gList.length > 0 && !loading && (
          <Table my="8" variant="striped">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Filmes</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {gList.map((list) => (
                <Tr key={list.idListType}>
                  <Td>{list.idListType.split("/")[1]}</Td>
                  <Td>
                    <Button
                      variant="link"
                      onClick={() => handleSeeList(list.movies)}
                    >
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
            </Tbody>
          </Table>
        )}
        {loading && (
          <Spinner size="lg" alignSelf="center" mt="4" color="blue.500" />
        )}
        {pagination.allPages > 1 && (
          <Flex justify="space-between" mt="8">
            <Button
              disabled={!(actualPage > 1)}
              variant="ghost"
              colorScheme="blue"
              onClick={handlePrevPage}
            >
              Voltar
            </Button>
            <Button
              disabled={!(actualPage < pagination.allPages)}
              variant="ghost"
              colorScheme="blue"
              onClick={handleNextPage}
            >
              Avançar
            </Button>
          </Flex>
        )}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          bodyChildren={
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Pontos</Th>
                </Tr>
              </Thead>
              <Tbody>
                {modalMovieList &&
                  modalMovieList.slice(0, 10).map((movie) => (
                    <Tr key={movie.name}>
                      <Td>{movie.name}</Td>
                      <Td>{movie.points}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          }
        />
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async () => {
    const generalList = await adminDb.collection("general_list").limit(2).get();
    const allPages = (await adminDb.collection("general_list").get()).docs
      .length;

    const decadesRef = adminDb.collection("decades");
    const decadesSnap = await decadesRef.get();
    if (decadesSnap.empty) {
      const decades = new Decades();
      db.collection("decades").doc("valid_decades").set({
        availables: decades.valid_decades.availables,
      });
    }
    const [validDecades] = decadesSnap.docs.map((year) => year.data());

    return {
      props: {
        generalList: generalList.docs.map((item) => ({
          movies: item.data().movies,
          idListType: item.data().id_list_type.path,
          status: item.data().status,
        })),
        validDecades: validDecades.availables,
        pagination: {
          allPages: Math.ceil(allPages / 2),
        },
      },
    };
  }
);
