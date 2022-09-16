import React, { useContext, useState, useEffect } from "react";

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsFillPersonFill, BsList } from "react-icons/bs";
import { GoSignOut } from "react-icons/go";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import AuthContext from "~/contexts/AuthContext";
import { webDb } from "~/lib/firebase";

import { CustomLink } from "../CustomLink";
import { Dropdown } from "../Sidebar/Dropdown";

interface ProfileMenuProps {
  loggedUser: {
    name: string;
    email: string;
    photoURL: string;
  };
  signOut: () => void;
}

export function ProfileMenu({ loggedUser, signOut }: ProfileMenuProps) {
  const { user } = useContext(AuthContext);
  const [disable, setDisable] = useState(false);

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
      justify={{ base: "space-between", lg: "center" }}
      w={{ base: "100%", lg: "auto" }}
      maxW={{ base: "340px", lg: "inherit" }}
      px="4"
    >
      <Box display={{ base: "block", lg: "none" }}>
        <Menu>
          {({ onClose }) => (
            <>
              <MenuButton
                as={IconButton}
                aria-label="Menu"
                variant="ghost"
                icon={<IoMdMenu size="36" />}
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
      <Flex
        display={{ base: "none", lg: "block" }}
        fontSize="small"
        color="gray.400"
        flexDir="column"
        justify="center"
        align="flex-end"
        mr="2"
      >
        <Text>{loggedUser?.name || ""}</Text>
        <Text>{loggedUser?.email}</Text>
      </Flex>
      <Menu>
        <MenuButton aria-label="Menu">
          <Image
            h={{ base: "36px", md: "48px" }}
            w={{ base: "36px", md: "48px" }}
            objectFit="cover"
            objectPosition="center"
            borderRadius={10}
            border="2px"
            bg="gray.100"
            borderColor="blue.400"
            src={
              loggedUser?.photoURL ||
              "https://icon-library.com/images/white-profile-icon/white-profile-icon-24.jpg"
            }
          />
        </MenuButton>
        <MenuList minW="0" w="fit-content">
          <MenuItem>
            <CustomLink href="/profile" icon={BsFillPersonFill} text="Perfil" />
          </MenuItem>
          <MenuItem
            as={Button}
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            fontWeight="normal"
            onClick={signOut}
            variant="unstyled"
            _hover={{ color: "blue.400" }}
          >
            <Icon mr="2" as={GoSignOut} />
            Sair
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}
