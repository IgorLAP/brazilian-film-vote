import React, { useContext, useEffect, useState } from "react";

import { Flex } from "@chakra-ui/react";

import AuthContext from "~/contexts/AuthContext";

import { Logo } from "./Logo";
import { ProfileMenu } from "./ProfileMenu";

export function Header() {
  const { user, signOut } = useContext(AuthContext);

  const [loggedUser, setLoggedUser] = useState<typeof user>();

  useEffect(() => {
    setLoggedUser(user);
  }, [user]);

  return (
    <Flex
      as="header"
      w="100%"
      maxW={{ xl: "1280px" }}
      pt={{ base: "2", lg: "0" }}
      ml={{ base: "0", xl: "auto" }}
      mr="5"
      h="100px"
      display="flex"
      flexDir={{ base: "column", lg: "row" }}
      justify="space-between"
      align="center"
    >
      <Logo />
      {loggedUser && <ProfileMenu loggedUser={loggedUser} signOut={signOut} />}
    </Flex>
  );
}
