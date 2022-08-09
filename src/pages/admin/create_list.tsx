import React, { useRef, useState } from "react";

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
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";

import { db as webDb } from "~/lib/firebase";
import { db as adminDb } from "~/lib/firebase-admin";
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
  const decadeSelectRef = useRef<HTMLSelectElement>();
  const [lTypes, setLTypes] = useState(listTypes);

  async function handleNewListType() {
    try {
      if (listName !== "" && !!decadeSelectRef.current.value) {
        const decade = Number(decadeSelectRef.current.value);
        const newListType = new ListType({ name: listName, decade });
        const listTypeDocRef = doc(webDb, "list_type", `${decade}-0`);

        const listTypeExists = (await getDoc(listTypeDocRef)).exists();
        if (listTypeExists) {
          const q = query(
            collection(webDb, "list_type"),
            where("decade", "==", decade)
          );
          const querySnap = await getDocs(q);
          const thisDecadeListTypesIds = querySnap.docs.map((item) => item.id);
          const lastUsedIndex = (thisDecadeListTypesIds.at(-1) as string).split(
            "-"
          )[1];

          const newIndex = Number(lastUsedIndex) + 1;
          await setDoc(doc(webDb, "list_type", `${decade}-${newIndex}`), {
            ...newListType,
          });

          const listTypeRef = doc(webDb, "list_type", `${decade}-${newIndex}`);
          const newGeneralList = new GeneralList({ idListType: listTypeRef });
          await setDoc(doc(webDb, "general_list", `${decade}-${newIndex}`), {
            id_list_type: newGeneralList.idListType,
            movies: newGeneralList.movies,
            status: newGeneralList.status,
          });
        } else {
          await setDoc(listTypeDocRef, {
            ...newListType,
          });

          const listTypeRef = doc(webDb, "list_type", `${decade}-0`);
          const newGeneralList = new GeneralList({ idListType: listTypeRef });
          await setDoc(doc(webDb, "general_list", `${decade}-0`), {
            id_list_type: newGeneralList.idListType,
            movies: newGeneralList.movies,
            status: newGeneralList.status,
          });
        }

        setLTypes((prevState) => [
          ...prevState,
          { name: listName, decade: decade as number },
        ]);
        setListName("");
        decadeSelectRef.current.value = "";
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
            <Select ref={decadeSelectRef} bg="gray.900">
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
            {lTypes.map((listType, index) => (
              <Tr key={`${index + 1}`}>
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
  const decadesRef = adminDb.collection("decades");
  const decadesSnap = await decadesRef.get();
  const [validDecades] = decadesSnap.docs.map((year) => year.data());

  const listTypeRef = adminDb.collection("list_type");
  const listTypeSnap = await listTypeRef.get();
  const listTypes = listTypeSnap.docs.map((list) => list.data());

  return {
    props: {
      validDecades: validDecades.availables,
      listTypes,
    },
  };
};
