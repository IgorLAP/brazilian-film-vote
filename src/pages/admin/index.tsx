import React, { useState } from "react";

import { Flex, Spinner, useDisclosure } from "@chakra-ui/react";
import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { SearchUser } from "~/presentation/components/Admin/SearchUser";
import { SendEmail } from "~/presentation/components/Admin/SendEmail";
import { UserListModal } from "~/presentation/components/Admin/UserListsModal";
import { UsersListsTable } from "~/presentation/components/Admin/UsersListsTable";
import { NextPrevPagination } from "~/presentation/components/NextPrevPagination";
import { verifySSRAuth } from "~/presentation/helpers/veritySSRAuth";
import { useToast } from "~/presentation/hooks/useToast";
import { GeneralListI } from "~/presentation/interfaces/GeneralList";
import { Movie } from "~/presentation/interfaces/Movie";
import { User } from "~/presentation/interfaces/User";
import { webDb } from "~/presentation/lib/firebase";
import { adminDb } from "~/presentation/lib/firebase-admin";

interface UserList extends Omit<GeneralListI, "movies"> {
  movies?: Movie[];
}

interface AdminProps {
  users: User[];
  pagination: {
    allPages: number;
  };
}

export default function Admin({ users, pagination }: AdminProps) {
  const { onClose, onOpen, open: isOpen } = useDisclosure();

  const toast = useToast();

  const [usersList, setUsersList] = useState(users);
  const [loading, setLoading] = useState(false);
  const [resultList, setResultList] = useState<User[]>([]);
  const [actualPage, setActualPage] = useState(1);
  const [firstPageItem, setFirstPageItem] = useState<User[]>([]);
  const [lastPageItem, setLastPageItem] = useState<User[]>([]);
  const [modalList, setModalList] = useState<UserList[]>([]);

  async function handleNextPage() {
    try {
      setLoading(true);
      const last = usersList.at(-1);
      const q = query(
        collection(webDb, "users"),
        orderBy("createdAt"),
        startAfter(last.createdAt),
        limit(21),
      );
      const { docs } = await getDocs(q);
      const newList = docs.map((i) => i.data());
      setLastPageItem((prev) => [...prev, usersList.at(-1)]);
      setFirstPageItem((prev) => [...prev, usersList[0]]);
      setUsersList(newList as User[]);
      setActualPage((prev) => prev + 1);
    } catch (err) {
      toast("error", "Erro no carregamento");
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
        limit(21),
      );
      const { docs } = await getDocs(q);
      const newList = docs.map((i) => i.data());
      setUsersList(newList as User[]);
      setLastPageItem((prev) =>
        prev.filter((item) => item.createdAt !== lastPageLast),
      );
      setFirstPageItem((prev) =>
        prev.filter((item) => item.createdAt !== firstPageLast),
      );
      setActualPage((prev) => prev - 1);
    } catch (err) {
      toast("error", "Erro no carregamento");
    }
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Brazilian Film Vote</title>
      </Head>
      <Flex w="100%" flexDir="column">
        <SendEmail />
        <SearchUser setLoading={setLoading} setResultList={setResultList} />
        {usersList.length > 0 && !loading && resultList.length <= 0 && (
          <UsersListsTable
            onOpen={onOpen}
            setModalList={setModalList}
            setUsersList={setUsersList}
            usersList={usersList}
          />
        )}
        {resultList.length > 0 && (
          <UsersListsTable
            onOpen={onOpen}
            setModalList={setModalList}
            setUsersList={setUsersList}
            usersList={resultList}
          />
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
      </Flex>
      <UserListModal modalList={modalList} isOpen={isOpen} onClose={onClose} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async () => {
    const allItems = (await adminDb.collection("users").get()).docs.filter(
      (user) => user.data().role !== "ADMIN",
    ).length;
    const usersRef = adminDb.collection("users").orderBy("createdAt").limit(21);
    const users = await usersRef.get();

    return {
      props: {
        users: users.docs.map((user) => user.data()),
        pagination: {
          allPages: Math.ceil(allItems / 21),
        },
      },
    };
  },
);
