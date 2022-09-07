import React, { FormEvent, useState, useEffect } from "react";

import { Flex, IconButton, Input } from "@chakra-ui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AiOutlineSearch } from "react-icons/ai";

import { useToast } from "~/hooks/useToast";
import { User } from "~/interfaces/User";
import { webDb } from "~/lib/firebase";

interface SearchUserProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setResultList: React.Dispatch<React.SetStateAction<User[]>>;
}

export function SearchUser({ setLoading, setResultList }: SearchUserProps) {
  const [userSearch, setUserSearch] = useState("");

  const toast = useToast();

  useEffect(() => {
    if (userSearch === "") setResultList([]);
  }, [userSearch]);

  async function handleUserSearch(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      const q = query(
        collection(webDb, "users"),
        where("email", "==", userSearch)
      );
      const { docs, empty } = await getDocs(q);
      if (empty) throw new Error("Usuário não encontrado");
      if (!empty) setResultList(docs.map((i) => i.data() as User));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast("error", err.message);
    }
  }

  return (
    <Flex
      mr={{ base: "4", xl: "0" }}
      alignSelf="flex-end"
      mt="8"
      as="form"
      onSubmit={handleUserSearch}
    >
      <Input
        type="text"
        placeholder="123@gmail.com"
        size={{ base: "sm", sm: "md" }}
        w={{ base: "80px", md: "180px" }}
        bg="white"
        color="black"
        _placeholder={{ color: "gray.500" }}
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
      />
      <IconButton
        size={{ base: "sm", sm: "md" }}
        aria-label="search user"
        type="submit"
        ml="0.5"
        bg="blue.500"
        _hover={{ bg: "blue.600" }}
        icon={<AiOutlineSearch />}
      />
    </Flex>
  );
}
