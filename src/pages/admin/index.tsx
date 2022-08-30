import React, { FormEvent, useContext, useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { FiTrash2 } from "react-icons/fi";

import {
  Button,
  Flex,
  FormControl,
  Icon,
  IconButton,
  Input,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
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

import { CustomButton } from "~/components/CustomButton";
import { LoadingContext } from "~/contexts/LoadingContext";
import { showAlert } from "~/helpers/showAlert";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { db as webDb } from "~/lib/firebase";
import { db } from "~/lib/firebase-admin";

interface User {
  name?: string;
  email: string;
  createdAt: string;
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

  const [usersList, setUsersList] = useState(users);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [resultList, setResultList] = useState<User[]>([]);
  const [actualPage, setActualPage] = useState(1);
  const [firstPageItem, setFirstPageItem] = useState<User[]>([]);
  const [lastPageItem, setLastPageItem] = useState<User[]>([]);

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
        limit(2)
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
        limit(2)
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

  const emailRegex = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const validEmail = newUserEmail.match(emailRegex);

  return (
    <>
      <Head>
        <title>Admin Dashboard - Brazilian film vote</title>
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
          <TableContainer my="8" w="100%">
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {usersList.map((user) => (
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
              </Tbody>
            </Table>
          </TableContainer>
        )}
        {resultList.length > 0 && (
          <TableContainer my="8" w="100%">
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
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
              </Tbody>
            </Table>
          </TableContainer>
        )}
        {loading && (
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
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async () => {
    const allPages = (await db.collection("users").get()).docs.filter(
      (user) => user.data().role !== "ADMIN"
    ).length;
    const usersRef = db.collection("users").orderBy("createdAt").limit(2);
    const users = await usersRef.get();

    return {
      props: {
        users: users.docs.map((user) => user.data()),
        pagination: {
          allPages: Math.ceil(allPages / 2),
        },
      },
    };
  }
);
