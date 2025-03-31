import React, { useContext, useEffect, useState } from "react";

import {
  Box,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "~/components/ui/menu"
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import AuthContext from "~/contexts/AuthContext";
import { webDb } from "~/lib/firebase";

import { CustomLink } from "../CustomLink";
import { Logo } from "./Logo";
import { ProfileMenu } from "./ProfileMenu";
import { Dropdown } from "../Sidebar/Dropdown";

export function Header() {
  const { user, signOut } = useContext(AuthContext);

  const [disable, setDisable] = useState(false);
  const [loggedUser, setLoggedUser] = useState<typeof user>();

  useEffect(() => {
    setLoggedUser(user);
  }, [user]);

  useEffect(() => {
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

  return (
    <Flex
      as="header"
      w="100%"
      maxW="1180"
      mx="auto"
      h="100px"
      display="flex"
      justify="space-between"
      align="center"
    >
      <Flex px={{ base: "2", xl: "0" }} align="center">
        <Box display={{ base: "block", lg: "none" }}>
          <MenuRoot>
            <MenuTrigger asChild>
              <IconButton
                aria-label="Menu"
                variant="ghost"
              >
                <IoMdMenu size="32" />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              {user && (
                <>
                  {user?.role === "USER" ? (
                    <>
                      <MenuItem onClick={onclose}>
                        <CustomLink
                          href={disable ? "" : "/user/vote"}
                          text="Votar"
                          icon={MdOutlineHowToVote}
                        />
                      </MenuItem>
                      <MenuItem>
                        <CustomLink
                          href="/user"
                          text="Minhas Listas"
                          icon={RiListSettingsLine}
                        />
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem>
                        <CustomLink
                          href="/admin"
                          text="Usuários"
                          icon={AiOutlineUsergroupDelete}
                        />
                      </MenuItem>
                      <MenuItem>
                        <CustomLink
                          href="/admin/lists"
                          text="Gerenciar Listas"
                          icon={BsList}
                        />
                      </MenuItem>
                    </>
                  )}
                  <MenuItem closeOnSelect={false}>
                    <Dropdown />
                    {/* FIXME: onResponsiveMenuClose={onclose} */}
                  </MenuItem>
                </>
              )}
            </MenuContent>
          </MenuRoot>
        </Box>
        <Link href="/">
          <Logo />
        </Link>
      </Flex>
      {loggedUser && <ProfileMenu loggedUser={loggedUser} signOut={signOut} />}
    </Flex>
  );
}
