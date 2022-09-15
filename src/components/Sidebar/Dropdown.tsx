import React, { useState, useEffect } from "react";

import {
  Box,
  Fade,
  Flex,
  Icon,
  Text,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import { MdLocalMovies } from "react-icons/md";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";

import { webDb } from "~/lib/firebase";
import { Decades } from "~/models/Decades";

import { CustomLink } from "../CustomLink";

interface DropdownProps {
  onResponsiveMenuClose?: () => void;
}

export function Dropdown({ onResponsiveMenuClose }: DropdownProps) {
  const { onToggle, isOpen } = useDisclosure();
  const router = useRouter();

  const hasOnCloseResponsiveMenu = useBreakpointValue({
    base: true,
    lg: false,
  });

  const [dropdown, setDropdown] = useState<string[] | []>([]);
  const [decades, setDecades] = useState<{ name: string; show: boolean }[]>([]);

  useEffect(() => {
    async function handleDropdown() {
      const snap = await getDocs(collection(webDb, "general_list"));
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
    if (isOpen) resetDropdown();
  }, [router.pathname]);

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

  function resetDropdown() {
    const tmp = [...decades];
    const hasToggled = [];
    tmp.forEach((item) => {
      if (item.show) {
        item.show = false;
        hasToggled.push(true);
      }
    });
    setDecades(tmp);
    onToggle();
  }

  const changeIcon = isOpen ? RiArrowDownSLine : RiArrowRightSLine;

  return (
    <Flex flexDir="column">
      <Flex
        ml="-1"
        color={isOpen ? "blue.500" : ""}
        _hover={{ color: "blue.600", cursor: "pointer" }}
        onClick={resetDropdown}
      >
        <Icon w={6} h={6} as={changeIcon} />
        <Text as="span">Listas</Text>
      </Flex>
      {isOpen && (
        <Fade style={{ marginTop: 6 }} in={isOpen}>
          {decades.length > 0 &&
            decades.map((dec) => {
              const showIcon = dec.show ? RiArrowDownSLine : RiArrowRightSLine;
              return (
                <Box key={dec.name} ml="1.5">
                  <Flex
                    mb="2"
                    color={dec.show ? "blue.500" : ""}
                    _hover={{ color: "blue.600", cursor: "pointer" }}
                    onClick={() => handleToggle(dec.name)}
                  >
                    <Icon w={5} h={6} as={showIcon} />
                    <Text as="span">{dec.name}</Text>
                  </Flex>
                  <Fade in={dec.show}>
                    {dec.show &&
                      dropdown
                        .filter((drop: string) => drop.includes(dec.name))
                        .map((slug) => (
                          <Box
                            key={slug}
                            ml="2"
                            my="2"
                            onClick={() => {
                              if (hasOnCloseResponsiveMenu)
                                onResponsiveMenuClose();
                              resetDropdown();
                            }}
                          >
                            <CustomLink
                              key={slug}
                              href={`/list/${slug}`}
                              text={slug}
                              icon={MdLocalMovies}
                            />
                          </Box>
                        ))}
                  </Fade>
                </Box>
              );
            })}
        </Fade>
      )}
    </Flex>
  );
}
