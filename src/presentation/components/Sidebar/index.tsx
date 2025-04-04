import React, { useContext, useEffect, useState } from "react";

import { Box, Skeleton, Stack } from "@chakra-ui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import { CustomLink } from "~/presentation/components/CustomLink";
import { AuthContext } from "~/presentation/contexts";
import { webDb } from "~/presentation/lib/firebase";

import { Dropdown } from "./Dropdown";

export function Sidebar() {
  const { user } = useContext(AuthContext);

  const [isVoteAvailable, setIsVoteAvailable] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      manageVotingDisponibility();
    }
  }, [user]);

  async function manageVotingDisponibility() {
    const usersListQuery = query(collection(webDb, `users/${user?.uid}/lists`));
    const { docs: listDocs } = await getDocs(usersListQuery);
    const userLists = listDocs.map((list) => list.id);
    const generalQuery = query(
      collection(webDb, "general_list"),
      where("status", "==", true),
    );
    const { empty, docs: activeListsDocs } = await getDocs(generalQuery);
    const activeListId = activeListsDocs.map((list) => list.id);
    if (empty) return;
    for (const activeList of activeListId) {
      for (const userList of userLists) {
        if (activeList === userList) {
          setIsVoteAvailable(false);
          return;
        }
      }
      setIsVoteAvailable(true);
    }
  }

  if (!hydrated) return null;

  return (
    <Box
      display={{ base: "none", lg: "block" }}
      ml={{ base: "5", xl: "0" }}
      as="aside"
      w="60"
      mr="6"
    >
      {user && (
        <Stack>
          {user?.role === "ADMIN" && (
            <>
              <CustomLink
                href="/admin"
                text="Usuários"
                icon={AiOutlineUsergroupDelete}
              />
              <CustomLink
                href="/admin/lists"
                text="Gerenciar Listas"
                icon={BsList}
              />
            </>
          )}
          {user?.role === "USER" && (
            <>
              <CustomLink
                href={isVoteAvailable ? "/user/vote" : ""}
                text="Votar"
                icon={MdOutlineHowToVote}
              />
              <CustomLink
                href="/user"
                text="Minhas Listas"
                icon={RiListSettingsLine}
              />
            </>
          )}
          <Dropdown />
        </Stack>
      )}
      {!user && (
        <Stack gap="4">
          <Skeleton height="25px" />
          <Skeleton height="25px" />
          <Skeleton height="25px" />
        </Stack>
      )}
    </Box>
  );
}
