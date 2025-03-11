import React from "react";

import {
  Button,
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { BsFillPersonFill } from "react-icons/bs";
import { GoSignOut } from "react-icons/go";

import { CustomLink } from "../CustomLink";

interface ProfileMenuProps {
  loggedUser: {
    name: string;
    email: string;
    photoURL: string;
  };
  signOut: () => void;
}

export function ProfileMenu({ loggedUser, signOut }: ProfileMenuProps) {
  return (
    <Flex
      justify={{ base: "space-between", lg: "center" }}
      w={{ lg: "auto" }}
      maxW={{ base: "340px", lg: "inherit" }}
      px={{ base: '4', xl: '0' }}
    >
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
        <MenuList bgColor="gray.900" minW="0" w="fit-content">
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
