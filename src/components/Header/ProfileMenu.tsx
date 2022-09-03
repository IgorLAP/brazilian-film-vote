import React from "react";

import {
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
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
    <Flex>
      <Flex
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
      <Popover>
        <PopoverTrigger>
          <Button variant="unstyled">
            <Image
              h="48px"
              w="48px"
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
          </Button>
        </PopoverTrigger>
        <PopoverContent w="28" mr="6" mt="1">
          <PopoverBody
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            flexDir="column"
          >
            <CustomLink href="/profile" icon={BsFillPersonFill} text="Perfil" />
            <Divider />
            <Button
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
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
}
