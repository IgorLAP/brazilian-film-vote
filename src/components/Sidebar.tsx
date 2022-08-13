import React, { useContext } from "react";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BiListPlus } from "react-icons/bi";
import { BsList } from "react-icons/bs";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import { Box, Stack } from "@chakra-ui/react";

import AuthContext from "~/contexts/AuthContext";

import { LinkSidebar } from "./LinkSidebar";

export function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <Box as="aside" w="60" mr="6">
      <Stack spacing="4">
        {user?.role === "ADMIN" && (
          <>
            <LinkSidebar
              href="/admin"
              text="Usuários"
              icon={AiOutlineUsergroupDelete}
            />
            <LinkSidebar
              href="/admin/create_list"
              text="Criar nova lista"
              icon={BiListPlus}
            />
            <LinkSidebar href="/admin/lists" text="Listas" icon={BsList} />
          </>
        )}
        {user?.role === "USER" && (
          <>
            <LinkSidebar
              href="/user/vote"
              text="Votar"
              icon={MdOutlineHowToVote}
            />
            <LinkSidebar
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
