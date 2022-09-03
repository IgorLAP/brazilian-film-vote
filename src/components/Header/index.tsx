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
      maxW="1280px"
      my="0"
      mx="auto"
      h="100px"
      display="flex"
      justify="space-between"
      align="center"
    >
      <Logo />
      {loggedUser && <ProfileMenu loggedUser={loggedUser} signOut={signOut} />}
    </Flex>
  );
}
