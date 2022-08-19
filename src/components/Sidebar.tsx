import React, { useContext } from "react";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import { Box, Stack } from "@chakra-ui/react";

import AuthContext from "~/contexts/AuthContext";

import { CustomLink } from "./CustomLink";

export function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <Box as="aside" w="60" mr="6">
      <Stack spacing="4">
        {user?.role === "ADMIN" && (
          <>
            <CustomLink
              href="/admin"
              text="Usuários"
              icon={AiOutlineUsergroupDelete}
            />
            <CustomLink href="/admin/lists" text="Listas" icon={BsList} />
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
      </Stack>
    </Box>
  );
}
