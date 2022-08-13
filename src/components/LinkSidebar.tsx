import React from "react";
import { IconType } from "react-icons/lib";

import {
  Flex,
  Icon,
  Link as ChakraLink,
  LinkProps,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";

interface LinkSidebarProps extends LinkProps {
  href: string;
  icon: IconType;
  text: string;
}

export function LinkSidebar({ href, icon, text, ...rest }: LinkSidebarProps) {
  const router = useRouter();

  return (
    <Flex
      color={router.pathname === href ? "blue.500" : ""}
      justify="flex-start"
    >
      <Icon fontSize="20" mr="2" as={icon} />
      <NextLink href={href}>
        <ChakraLink {...rest}>
          <Text>{text}</Text>
        </ChakraLink>
      </NextLink>
    </Flex>
  );
}
