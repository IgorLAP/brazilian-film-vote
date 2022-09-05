import React, { useContext } from "react";

import { Box, Stack } from "@chakra-ui/react";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import { CustomLink } from "~/components/CustomLink";
import AuthContext from "~/contexts/AuthContext";

import { Dropdown } from "./Dropdown";

export function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <Box
      display={{ base: "none", md: "block" }}
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
                href="/user/vote"
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
