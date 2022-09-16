import React, { useContext, useEffect, useState } from "react";

import { Box, Stack } from "@chakra-ui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import { CustomLink } from "~/components/CustomLink";
import AuthContext from "~/contexts/AuthContext";
import { webDb } from "~/lib/firebase";

import { Dropdown } from "./Dropdown";

export function Sidebar() {
  const { user } = useContext(AuthContext);

  const [disable, setDisable] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (user?.role === "ADMIN") return;
    async function handle() {
      const usersListQuery = query(
        collection(webDb, `users/${user?.uid}/lists`)
      );
      const { docs: listDocs } = await getDocs(usersListQuery);
      const userLists = listDocs.map((list) => list.id);
      const generalQuery = query(
        collection(webDb, "general_list"),
        where("status", "==", true)
      );
      const { empty, docs: activeListsDocs } = await getDocs(generalQuery);
      const activeListId = activeListsDocs.map((list) => list.id);
      if (empty) return;
      for (const activeList of activeListId) {
        for (const userList of userLists) {
          if (activeList === userList) {
            setDisable(true);
            return;
          }
        }
        setDisable(false);
      }
    }
    handle();
  }, []);

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
        <Stack spacing="4">
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
                href={disable ? "" : "/user/vote"}
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
    </Box>
  );
}
