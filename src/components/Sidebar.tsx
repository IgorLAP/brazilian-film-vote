import React, { useContext } from "react";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BiListPlus } from "react-icons/bi";
import { BsList } from "react-icons/bs";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import {
  Box,
  Flex,
  Icon,
  Stack,
  Text,
  Link as ChakraLink,
} from "@chakra-ui/react";
import NextLink from "next/link";

import AuthContext from "~/contexts/AuthContext";

export function Sidebar() {
  const { user } = useContext(AuthContext);
  return (
    <Box as="aside" w="60" mr="6">
      <Stack spacing="4">
        {user?.role === "ADMIN" && (
          <>
            <Flex justify="flex-start">
              <Icon fontSize="20" mr="2" as={AiOutlineUsergroupDelete} />
              <NextLink href="/admin">
                <ChakraLink>
                  <Text>Usuários</Text>
                </ChakraLink>
              </NextLink>
            </Flex>
            <Flex justify="flex-start">
              <Icon fontSize="20" mr="2" as={BiListPlus} />
              <NextLink href="/admin/create_list">
                <ChakraLink>
                  <Text>Criar nova lista</Text>
                </ChakraLink>
              </NextLink>
            </Flex>
            <Flex justify="flex-start">
              <Icon fontSize="20" mr="2" as={BsList} />
              <NextLink href="/admin/lists">
                <ChakraLink>
                  <Text>Listas</Text>
                </ChakraLink>
              </NextLink>
            </Flex>
          </>
        )}
        {user?.role === "USER" && (
          <>
            <Flex justify="flex-start">
              <Icon fontSize="20" mr="2" as={MdOutlineHowToVote} />
              <NextLink href="/user/vote">
                <ChakraLink>
                  <Text>Votar</Text>
                </ChakraLink>
              </NextLink>
            </Flex>
            <Flex justify="flex-start">
              <Icon fontSize="20" mr="2" as={RiListSettingsLine} />
              <NextLink href="/user">
                <ChakraLink>
                  <Text>Minhas Listas</Text>
                </ChakraLink>
              </NextLink>
            </Flex>
          </>
        )}
      </Stack>
    </Box>
  );
}
