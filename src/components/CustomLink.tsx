import React, { useContext } from "react";

import {
  Flex,
  Icon,
  Link as ChakraLink,
  LinkProps,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { IconType } from "react-icons/lib";

import { LoadingContext } from "~/contexts/LoadingContext";

interface CustomLinkProps extends LinkProps {
  href: string;
  icon: IconType;
  text: string;
}

export function CustomLink({ href, icon, text, ...rest }: CustomLinkProps) {
  const { handleLoading } = useContext(LoadingContext);

  const router = useRouter();

  function handleClick(link: string) {
    if (link === "/user/vote") {
      handleLoading(15, 1000);
      router.push(link);
      return;
    }
    handleLoading(20, 1000);
    router.push(link);
  }

  return (
    <Flex
      color={
        router.pathname === href ||
        (router.pathname === "/list/[id]" && router.asPath.includes(href))
          ? "blue.500"
          : ""
      }
      _hover={{ color: "blue.500", cursor: "pointer" }}
      justify="flex-start"
    >
      <Icon fontSize="20" mr="2" as={icon} />
      <NextLink href="#">
        <ChakraLink
          _hover={{ textDecoration: "none" }}
          onClick={() => handleClick(href)}
          {...rest}
        >
          <Text>{text}</Text>
        </ChakraLink>
      </NextLink>
    </Flex>
  );
}
