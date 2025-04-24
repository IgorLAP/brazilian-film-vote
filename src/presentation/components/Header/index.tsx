import React, { useContext, useEffect, useState } from "react";

import { Box, Flex, IconButton } from "@chakra-ui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "~/presentation/components/ui/menu";
import { AuthContext } from "~/presentation/contexts";
import { webDb } from "~/presentation/lib/firebase";

import { CustomLink } from "../CustomLink";
import { Dropdown } from "../Sidebar/Dropdown";
import { Logo } from "./Logo";
import { ProfileMenu } from "./ProfileMenu";
import { makeUserSignOut } from "~/factories/user";

export function Header() {
  const { user } = useContext(AuthContext);
  const { signOut } = makeUserSignOut();

  const [isVoteAvailable, setIsVoteAvailable] = useState(false);
  const [loggedUser, setLoggedUser] = useState<typeof user>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedUser(user);
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
      where("status", "==", true)
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
          <MenuRoot
            open={isMenuOpen}
            onOpenChange={(e) => setIsMenuOpen(e.open)}
          >
            <MenuTrigger asChild>
              <IconButton aria-label="Menu" variant="ghost">
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
                          href={isVoteAvailable ? "/user/vote" : ""}
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
                    <Dropdown onResponsiveMenuClose={setIsMenuOpen} />
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

