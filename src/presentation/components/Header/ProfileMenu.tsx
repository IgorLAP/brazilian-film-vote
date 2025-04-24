import React from "react";

import { Button, Flex, Icon, IconButton, Image, Text } from "@chakra-ui/react";
import { BsFillPersonFill } from "react-icons/bs";
import { GoSignOut } from "react-icons/go";

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "~/presentation/components/ui/menu";

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
      px={{ base: "4", xl: "0" }}
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
      <MenuRoot>
        <MenuTrigger>
          <IconButton size={{ base: "sm", md: "lg" }} aria-label="Menu">
            <Image
              h={{ base: "34px", md: "40px" }}
              w={{ base: "34px", md: "40px" }}
              objectFit="cover"
              objectPosition="center"
              borderRadius={2}
              border="2px"
              bg="gray.100"
              borderColor="blue.400"
              src={loggedUser?.photoURL || "/images/profile_icon.jpg"}
            />
          </IconButton>
        </MenuTrigger>
        <MenuContent minW="0" w="fit-content">
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
            _hover={{ color: "blue.400", cursor: "pointer" }}
          >
            <Icon as={GoSignOut} />
            Sair
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Flex>
  );
}

