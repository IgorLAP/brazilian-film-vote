import React, { useContext } from "react";

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
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsFillPersonFill, BsList } from "react-icons/bs";
import { GoSignOut } from "react-icons/go";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import AuthContext from "~/contexts/AuthContext";

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

  return (
    <Flex
      justify={{ base: "space-between", md: "center" }}
      w={{ base: "100%", md: "auto" }}
      maxW={{ base: "340px", md: "inherit" }}
      px="1"
    >
      <Box display={{ base: "block", md: "none" }}>
        <Menu>
          {({ onClose }) => (
            <>
              <MenuButton
                as={IconButton}
                aria-label="Menu"
                variant="ghost"
                icon={<IoMdMenu size="40" />}
              />
              {user && (
                <MenuList>
                  {user?.role === "USER" ? (
                    <>
                      <MenuItem onClick={onClose}>
                        <CustomLink
                          href="/user/vote"
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
        display={{ base: "none", md: "block" }}
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
            h={{ base: "40px", md: "48px" }}
            w={{ base: "40px", md: "48px" }}
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
        <MenuList>
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
