import React, { useContext, useEffect, useState } from "react";

import { Box, Stack, useDisclosure } from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import { AiOutlineUsergroupDelete } from "react-icons/ai";
import { BsList } from "react-icons/bs";
import { MdOutlineHowToVote } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";

import { CustomLink } from "~/components/CustomLink";
import AuthContext from "~/contexts/AuthContext";
import { db } from "~/lib/firebase";
import { Decades } from "~/models/Decades";

import { Dropdown } from "./Dropdown";

export function Sidebar() {
  const { user } = useContext(AuthContext);

  const { onToggle, isOpen } = useDisclosure();

  const [dropdown, setDropdown] = useState<string[] | []>([]);
  const [decades, setDecades] = useState<{ name: string; show: boolean }[]>([]);

  useEffect(() => {
    async function handleDropdown() {
      const snap = await getDocs(collection(db, "general_list"));
      const array = snap.docs.map((item) => {
        if (!item.data().status) return item.id;
        return [];
      });
      return array.filter((item) => typeof item === "string");
    }
    const handle = async () => {
      setDropdown((await handleDropdown()) as string[] | []);
    };
    handle();
  }, []);

  useEffect(() => {
    if (dropdown.length > 0) {
      const decs: number[] = new Decades().valid_decades.availables;
      const tmp: string[] = [];
      for (const drop of dropdown) {
        for (const dec of decs) {
          const alreadyHas = decades.filter(
            (item) => item.name === String(dec)
          );
          if (drop.includes(String(dec)) && alreadyHas.length <= 0) {
            tmp.push(String(dec));
          }
        }
      }
      const newDecNames = [...new Set(tmp)];
      setDecades(() => {
        return newDecNames.map((item) => ({
          name: item,
          show: false,
        }));
      });
    }
  }, [dropdown]);

  function handleToggle(dec: string) {
    setDecades((prev) => {
      const tmp = [...prev];
      const index = prev.findIndex((item) => item.name === dec);
      tmp[index].show = !tmp[index].show;
      tmp.forEach((item, i) => {
        if (item.show && i !== index) item.show = !item.show;
      });
      return tmp;
    });
  }

  return (
    <Box as="aside" w="60" mr="6">
      {user && (
        <Stack spacing="4">
          {user?.role === "ADMIN" && (
            <>
              <CustomLink
                href="/admin"
                text="Usuários"
                icon={AiOutlineUsergroupDelete}
              />
              <CustomLink
                href="/admin/lists"
                text="Gerenciar Listas"
                icon={BsList}
              />
            </>
          )}
          {user?.role === "USER" && (
            <>
              <CustomLink
                href="/user/vote"
                text="Votar"
                icon={MdOutlineHowToVote}
              />
              <CustomLink
                href="/user"
                text="Minhas Listas"
                icon={RiListSettingsLine}
              />
            </>
          )}
          <Dropdown
            isOpen={isOpen}
            onToggle={onToggle}
            handleToggle={handleToggle}
            dropdown={dropdown}
            decades={decades}
          />
        </Stack>
      )}
    </Box>
  );
}
