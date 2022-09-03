import React from "react";

import { Box, Button, Fade, Flex, Text } from "@chakra-ui/react";
import { MdLocalMovies } from "react-icons/md";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";

import { CustomLink } from "../CustomLink";

interface DropdownProps {
  isOpen: boolean;
  decades: { name: string; show: boolean }[];
  dropdown: string[] | [];
  onToggle: () => void;
  handleToggle: (name: string) => void;
}

export function Dropdown({
  isOpen,
  onToggle,
  decades,
  dropdown,
  handleToggle,
}: DropdownProps) {
  const dropDownIcon = isOpen ? RiArrowDownSLine : RiArrowRightSLine;

  return (
    <>
      <Flex
        color={isOpen ? "blue.500" : ""}
        _hover={{ color: "blue.600", cursor: "pointer" }}
        onClick={onToggle}
      >
        <Button
          variant="unstyled"
          size="xs"
          mr="1"
          ml="-1.5"
          as={dropDownIcon}
        />
        <Text as="span">Listas</Text>
      </Flex>
      <Fade style={{ marginBottom: 8 }} in={isOpen}>
        {decades.length > 0 &&
          decades.map((dec) => (
            <Box key={dec.name} ml="1.5">
              <Flex
                mb="2"
                color={dec.show ? "blue.500" : ""}
                _hover={{ color: "blue.600", cursor: "pointer" }}
                onClick={() => handleToggle(dec.name)}
              >
                <Button
                  variant="unstyled"
                  size="xs"
                  mr="1"
                  ml="-1.5"
                  as={dec.show ? RiArrowDownSLine : RiArrowRightSLine}
                />
                <Text as="span">{dec.name}</Text>
              </Flex>
              <Fade in={dec.show}>
                {dec.show &&
                  dropdown
                    .filter((drop: string) => drop.includes(dec.name))
                    .map((slug) => (
                      <Box key={slug} ml="2" my="2">
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
          ))}
      </Fade>
    </>
  );
}
