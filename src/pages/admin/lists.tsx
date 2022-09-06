import React, { useContext, useRef, useState } from "react";

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spinner,
  Td,
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
import { NextPrevPagination } from "~/components/NextPrevPagination";
import { Table } from "~/components/Table";
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
        collection: "general_list",
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
        collection: "general_list",
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
        <title>Listas - Brazilian Film Vote</title>
      </Head>
      <Flex mx={{ base: "4", xl: "0" }} flexDir="column">
        <Flex
          bg="gray.800"
          py={{ base: "2", md: "4" }}
          px={{ base: "4", md: "6" }}
          mb="4"
          borderRadius={6}
          as="form"
          justify={{ base: "center", sm: "flex-start" }}
          align="center"
          alignSelf={{ base: "", sm: "flex-start" }}
        >
          <Flex
            justify="center"
            align="center"
            flexDir={{ base: "column", sm: "row" }}
          >
            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>
                Nome da lista
              </FormLabel>
              <Input
                size={{ base: "sm", md: "md" }}
                bg="gray.900"
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
            </FormControl>
            <FormControl mx="4" py={{ base: "4", md: "0" }}>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Década</FormLabel>
              <Select
                size={{ base: "sm", md: "md" }}
                ref={decadeSelectRef}
                bg="gray.900"
              >
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
          </Flex>
        </Flex>
        {gList.length > 0 && !loading && (
          <Table
            my="8"
            variant="striped"
            tableHeaders={["ID", "Filmes", "Status", "Visualizar"]}
          >
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
          </Table>
        )}
        {loading && (
          <Spinner size="lg" alignSelf="center" mt="4" color="blue.500" />
        )}
        {pagination.allPages > 1 && (
          <NextPrevPagination
            actualPage={actualPage}
            allPages={pagination.allPages}
            handleNextPage={handleNextPage}
            handlePrevPage={handlePrevPage}
          />
        )}
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
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async () => {
    const generalList = await adminDb
      .collection("general_list")
      .limit(20)
      .get();
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
          allPages: Math.ceil(allPages / 20),
        },
      },
    };
  }
);
