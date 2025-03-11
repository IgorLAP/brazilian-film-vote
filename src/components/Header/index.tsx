/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useEffect, useState } from "react";

import { Box, Flex, IconButton, Link, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import NextLink from "next/link";

import AuthContext from "~/contexts/AuthContext";

import { Logo } from "./Logo";
import { ProfileMenu } from "./ProfileMenu";
import { CustomLink } from "../CustomLink";
import { IoMdMenu } from "react-icons/io";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { RiListSettingsLine } from "react-icons/ri";
import { MdOutlineHowToVote } from "react-icons/md";
import { BsList } from "react-icons/bs";
import { Dropdown } from "../Sidebar/Dropdown";
import { collection, getDocs, query, where } from "firebase/firestore";
import { webDb } from "~/lib/firebase";

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
      mx='auto'
      h="100px"
      display="flex"
      justify="space-between"
      align="center"
    >
      <Flex
        px={{ base: '2', xl: '0' }}
        align="center"
      >
        <Box display={{ base: "block", lg: "none" }}>
          <Menu>
            {({ onClose }) => (
              <>
                <MenuButton
                  as={IconButton}
                  aria-label="Menu"
                  variant="ghost"
                  icon={<IoMdMenu size="32" />}
                />
                {user && (
                  <MenuList minW="0" w="fit-content">
                    {user?.role === "USER" ? (
                      <>
                        <MenuItem onClick={onClose}>
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
                      <Dropdown onResponsiveMenuClose={onClose} />
                    </MenuItem>
                  </MenuList>
                )}
              </>
            )}
          </Menu>
        </Box>
        <NextLink href="/" passHref>
          <Link _hover={{ textDecoration: "none" }}>
            <Logo />
          </Link>
        </NextLink>

      </Flex>
      {loggedUser && <ProfileMenu loggedUser={loggedUser} signOut={signOut} />}
    </Flex>
  );
}
