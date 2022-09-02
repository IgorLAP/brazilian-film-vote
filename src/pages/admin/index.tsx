import React, { FormEvent, useContext, useEffect, useState } from "react";

import {
  Button,
  Flex,
  FormControl,
  Grid,
  Icon,
  IconButton,
  Image,
  Input,
  Spinner,
  Stack,
  Td,
  Text,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { AiOutlineSearch } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import { CustomButton } from "~/components/CustomButton";
import { Modal } from "~/components/Modal";
import { MovieDetail } from "~/components/MovieDetail";
import { Table } from "~/components/Table";
import { LoadingContext } from "~/contexts/LoadingContext";
import { showAlert } from "~/helpers/showAlert";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { GeneralListI } from "~/interfaces/GeneralList";
import { Movie, ShowMovie } from "~/interfaces/Movie";
import { TmdbMovie, TmdbMovieCredit } from "~/interfaces/Tmdb";
import { db as webDb } from "~/lib/firebase";
import { db } from "~/lib/firebase-admin";
import { tmdbApi } from "~/lib/tmdb";

interface User {
  name?: string;
  email: string;
  createdAt: string;
}

interface UserList extends Omit<GeneralListI, "movies"> {
  movies?: Movie[];
}

interface AdminProps {
  users: User[];
  pagination: {
    allPages: number;
  };
}

const actionCodeSetting = {
  url: `${process.env.NEXT_PUBLIC_SITE_URL}/signin`,
  handleCodeInApp: true,
};

export default function Admin({ users, pagination }: AdminProps) {
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [usersList, setUsersList] = useState(users);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [resultList, setResultList] = useState<User[]>([]);
  const [actualPage, setActualPage] = useState(1);
  const [firstPageItem, setFirstPageItem] = useState<User[]>([]);
  const [lastPageItem, setLastPageItem] = useState<User[]>([]);
  const [modalList, setModalList] = useState<UserList[]>([]);
  const [selectedList, setSelectedList] = useState<ShowMovie[]>([]);

  useEffect(() => {
    if (userSearch === "") setResultList([]);
  }, [userSearch]);

  async function handleNewUser() {
    try {
      handleLoading(20, 500);
      const auth = getAuth();
      const q = query(
        collection(webDb, "users"),
        where("email", "==", newUserEmail)
      );
      const hasUser = await getDocs(q);
      if (hasUser.empty) {
        await sendSignInLinkToEmail(auth, newUserEmail, actionCodeSetting);
        showToast("success", "Email enviado");
        clearLoading();
        setNewUserEmail("");
      } else {
        throw new Error("Email já cadastrado");
      }
    } catch (err) {
      clearLoading();
      showToast("error", err.message);
    }
  }

  async function handleDeleteUser(email: string) {
    try {
      const { isConfirmed } = await showAlert({
        title: "Confirmar ação",
        text: `Deletar usuário de email: ${email}?`,
      });
      if (!isConfirmed) return;
      handleLoading(25, 500);
      const q = query(collection(webDb, "users"), where("email", "==", email));
      const querySnap = await getDocs(q);
      const [userID] = querySnap.docs.map((i) => i.id);
      await axios.post("/api/delete-lists", { userID });
      await deleteDoc(doc(webDb, "users", userID));
      await axios.post("/api/auth-delete", { email });
      setUsersList((prevState) =>
        prevState.filter((user) => user.email !== email)
      );
      clearLoading();
      showToast("success", "Deletado");
    } catch (err) {
      clearLoading();
      showToast("error", err.message);
    }
  }

  async function handleNextPage() {
    try {
      setLoading(true);
      const last = usersList.at(-1);
      const q = query(
        collection(webDb, "users"),
        orderBy("createdAt"),
        startAfter(last.createdAt),
        limit(20)
      );
      const { docs } = await getDocs(q);
      const newList = docs.map((i) => i.data());
      setLastPageItem((prev) => [...prev, usersList.at(-1)]);
      setFirstPageItem((prev) => [...prev, usersList[0]]);
      setUsersList(newList as User[]);
      setActualPage((prev) => prev + 1);
    } catch (err) {
      showToast("error", "Erro no carregamento");
    }
    setLoading(false);
  }

  async function handlePrevPage() {
    try {
      setLoading(true);
      const firstPageLast = firstPageItem.at(-1).createdAt;
      const lastPageLast = lastPageItem.at(-1).createdAt;
      const q = query(
        collection(webDb, "users"),
        orderBy("createdAt"),
        startAt(firstPageLast),
        endAt(lastPageLast),
        limit(20)
      );
      const { docs } = await getDocs(q);
      const newList = docs.map((i) => i.data());
      setUsersList(newList as User[]);
      setLastPageItem((prev) =>
        prev.filter((item) => item.createdAt !== lastPageLast)
      );
      setFirstPageItem((prev) =>
        prev.filter((item) => item.createdAt !== firstPageLast)
      );
      setActualPage((prev) => prev - 1);
    } catch (err) {
      showToast("error", "Erro no carregamento");
    }
    setLoading(false);
  }

  async function handleUserSearch(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      const q = query(
        collection(webDb, "users"),
        where("email", "==", userSearch)
      );
      const { docs, empty } = await getDocs(q);
      if (empty) throw new Error("Usuário não encontrado");
      if (!empty) setResultList(docs.map((i) => i.data() as User));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showToast("error", err.message);
    }
  }

  async function handleSeeUsersList(email: string) {
    handleLoading(30, 1000);
    try {
      const q = query(collection(webDb, "users"), where("email", "==", email));
      const [user] = (await getDocs(q)).docs;
      const usersListsRef = collection(webDb, `users/${user.id}/lists`);
      const listq = query(usersListsRef);
      const usersLists = await getDocs(listq);
      if (usersLists.empty) {
        clearLoading();
        showToast("warn", "Usuário não possui listas");
        return;
      }
      setModalList(
        usersLists.docs.map((item) => ({
          idListType: item.data().id_list_type,
          movies: item.data().movies,
          status: item.data().status,
        })) as GeneralListI[]
      );
      onOpen();
    } catch (err) {
      showToast("error", "Erro ao carregar informações");
    }
    clearLoading();
  }

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
      showToast("error", err.message);
    }
    setLoading(false);
  }

  const emailRegex = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const validEmail = newUserEmail.match(emailRegex);
  const posterPathBase = "https://image.tmdb.org/t/p/w185";

  return (
    <>
      <Head>
        <title>Admin Dashboard - Brazilian Film Vote</title>
      </Head>
      <Flex w="100%" flexDir="column">
        <Stack spacing="4" borderRadius="4">
          <CustomButton
            buttonType="primary"
            alignSelf="flex-start"
            disabled={!validEmail}
            onClick={handleNewUser}
          >
            Enviar email de cadastro
          </CustomButton>

          <FormControl w="420px">
            <Input
              bg="white"
              color="black"
              _placeholder={{ color: "gray.500" }}
              type="email"
              placeholder="E-mail"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
          </FormControl>
        </Stack>
        <Flex alignSelf="flex-end" mt="8" as="form" onSubmit={handleUserSearch}>
          <Input
            type="text"
            placeholder="123@gmail.com"
            w="180px"
            bg="white"
            color="black"
            _placeholder={{ color: "gray.500" }}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <IconButton
            aria-label="search user"
            type="submit"
            ml="0.5"
            bg="blue.500"
            _hover={{ bg: "blue.600" }}
            icon={<AiOutlineSearch />}
          />
        </Flex>
        {usersList.length > 0 && !loading && resultList.length <= 0 && (
          <Table
            my="8"
            tableHeaders={["Nome", "Email", "Listas", "Excluir"]}
            variant="striped"
          >
            {usersList.map((user) => (
              <Tr key={user.email}>
                <Td>{user?.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <CustomButton
                    onClick={() => handleSeeUsersList(user.email)}
                    buttonType="warn"
                  >
                    <Icon as={BsList} />
                  </CustomButton>
                </Td>
                <Td>
                  <CustomButton
                    buttonType="danger"
                    onClick={() => handleDeleteUser(user.email)}
                  >
                    <Icon as={FiTrash2} />
                  </CustomButton>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
        {resultList.length > 0 && (
          <Table
            my="8"
            variant="striped"
            tableHeaders={["Nome", "Email", "Excluir"]}
          >
            {resultList.map((user) => (
              <Tr key={user.email}>
                <Td>{user?.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <CustomButton
                    buttonType="danger"
                    onClick={() => handleDeleteUser(user.email)}
                  >
                    <Icon as={FiTrash2} />
                  </CustomButton>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
        {loading && modalList.length <= 0 && (
          <Spinner size="lg" alignSelf="center" mt="4" color="blue.500" />
        )}
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
      </Flex>
      <Modal
        size={selectedList.length > 0 ? "4xl" : "xs"}
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
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async () => {
    const allItems = (await db.collection("users").get()).docs.filter(
      (user) => user.data().role !== "ADMIN"
    ).length;
    const usersRef = db.collection("users").orderBy("createdAt").limit(20);
    const users = await usersRef.get();

    return {
      props: {
        users: users.docs.map((user) => user.data()),
        pagination: {
          allPages: Math.ceil(allItems / 20),
        },
      },
    };
  }
);
