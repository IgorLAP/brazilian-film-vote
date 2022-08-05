import React, { useState } from "react";

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { doc, setDoc } from "firebase/firestore";
import { GetServerSideProps } from "next";

import { db as webDb } from "~/lib/firebase";
import { db } from "~/lib/firebase-admin";
import { GeneralList } from "~/models/GeneralList";
import { ListType } from "~/models/ListType";

interface createListProps {
  validDecades: number[];
  listTypes: {
    name: string;
    decade: number;
  }[];
}

export default function createList({
  validDecades,
  listTypes,
}: createListProps) {
  const [listName, setListName] = useState("");
  const [decade, setDecade] = useState<number | "">();
  const [lTypes, setLTypes] = useState(listTypes);

  async function handleNewListType() {
    try {
      if (listName !== "" && !!decade) {
        const newListType = new ListType({ name: listName, decade });
        await setDoc(doc(webDb, "list_type", String(decade)), {
          ...newListType,
        });

        const listTypeRef = doc(webDb, "list_type", String(decade));
        const newGeneralList = new GeneralList({ idListType: listTypeRef });
        await setDoc(doc(webDb, "general_list", String(decade)), {
          ...newGeneralList,
        });

        setLTypes((prevState) => [
          ...prevState,
          { name: listName, decade: decade as number },
        ]);
        setListName("");
        setDecade("");
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Flex flexDir="column">
      <Flex
        bg="gray.800"
        py="4"
        px="6"
        borderRadius={6}
        as="form"
        justify="flex-start"
        align="center"
        alignSelf="flex-start"
      >
        <HStack spacing="4">
          <FormControl>
            <FormLabel>Nome da lista</FormLabel>
            <Input
              bg="gray.900"
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Década</FormLabel>
            <Select
              onChange={(e) => setDecade(Number(e.target.value))}
              bg="gray.900"
            >
              <option value="">Selecione</option>
              {validDecades.map((decadeOpt) => (
                <option value={decadeOpt} key={decadeOpt}>
                  {decadeOpt}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button
            alignSelf="flex-end"
            bg="blue.500"
            type="button"
            _hover={{ bg: "blue.600" }}
            onClick={handleNewListType}
          >
            Criar
          </Button>
        </HStack>
      </Flex>
      <TableContainer my="8">
        <Heading as="h1" fontSize="2xl">
          Décadas cadastradas
        </Heading>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Década</Th>
            </Tr>
          </Thead>
          <Tbody>
            {lTypes.map((listType) => (
              <Tr key={listType.decade}>
                <Td>{listType.name}</Td>
                <Td>{listType.decade}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const decadesRef = db.collection("decades");
  const decadesSnap = await decadesRef.get();
  const validDecades = decadesSnap.docs.map((year) => year.data())[0]
    .availables;

  const listTypeRef = db.collection("list_type");
  const listTypeSnap = await listTypeRef.get();
  const listTypes = listTypeSnap.docs.map((list) => list.data());

  return {
    props: {
      validDecades,
      listTypes,
    },
  };
};
