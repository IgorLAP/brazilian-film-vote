import React, { useContext, useEffect, useState } from "react";
import { BsFillPersonFill } from "react-icons/bs";
import { GoSignOut } from "react-icons/go";

import {
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Link as ChakraLink,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";

import AuthContext from "~/contexts/AuthContext";

export function Header() {
  const { user, signOut } = useContext(AuthContext);

  const [loggedUser, setLoggedUser] = useState<typeof user>();

  useEffect(() => {
    setLoggedUser(user);
  }, [user]);

  return (
    <Flex
      as="header"
      maxW="1280px"
      my="0"
      mx="auto"
      h="100px"
      display="flex"
      justify="space-between"
      align="center"
    >
      <Text fontSize="3xl">
        🎬
        <Text color="green.500" as="span">
          b
        </Text>
        <Text color="yellow.500" as="span">
          r
        </Text>
        azilian film vote
      </Text>
      {loggedUser && (
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
                <Flex
                  _hover={{ color: "blue.400" }}
                  w="100%"
                  justify="flex-start"
                  align="center"
                >
                  <Icon mr="2" as={BsFillPersonFill} />
                  <NextLink href="/profile">
                    <ChakraLink _hover={{ textDecoration: "none" }}>
                      Profile
                    </ChakraLink>
                  </NextLink>
                </Flex>

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
      )}
    </Flex>
  );
}
