import React, { useState, useContext, useRef } from "react";

import { Flex, FormControl, FormLabel, Input, Select } from "@chakra-ui/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { LoadingContext } from "~/contexts/LoadingContext";
import { useToast } from "~/hooks/useToast";
import { ExhibitGeneralListI } from "~/interfaces/GeneralList";
import { webDb } from "~/lib/firebase";
import { GeneralList } from "~/models/GeneralList";
import { ListType } from "~/models/ListType";

import { CustomButton } from "../CustomButton";

interface CreateListProps {
  validDecades: number[];
  gList: ExhibitGeneralListI[];
  setGList: React.Dispatch<React.SetStateAction<ExhibitGeneralListI[]>>;
}

export function CreateList({ validDecades, gList, setGList }: CreateListProps) {
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const toast = useToast();

  const [listName, setListName] = useState("");
  const decadeSelectRef = useRef<HTMLSelectElement>();

  async function handleNewListType() {
    handleLoading(20, 1000);
    const isRequiredFieldsInvalid =
      listName === "" || !decadeSelectRef.current.value;
    const decadeCurrentlyVoting = gList.filter((list) => {
      return (
        list.status &&
        list.idListType.split("/")[1].split("-")[0] ===
          decadeSelectRef.current.value
      );
    });
    try {
      if (isRequiredFieldsInvalid) {
        throw new Error("Preencha o nome e a década");
      }

      if (!isRequiredFieldsInvalid && decadeCurrentlyVoting.length > 0) {
        throw new Error(
          `Votação dos anos ${decadeSelectRef.current.value} ainda em curso`
        );
      }
      const activeQuery = query(
        collection(webDb, "general_list"),
        where("status", "==", true)
      );
      const activeSnap = await getDocs(activeQuery);
      if (!activeSnap.empty) {
        throw new Error("Finalize a votação atual para iniciar outra");
      }
      const decade = Number(decadeSelectRef.current.value);
      const newListType = new ListType({ name: listName, decade });
      const listTypeDocRef = doc(webDb, "list_type", `${decade}-0`);

      const listTypeExists = (await getDoc(listTypeDocRef)).exists();
      if (listTypeExists) {
        const decadeQuery = query(
          collection(webDb, "list_type"),
          where("decade", "==", decade)
        );
        const decadeSnap = await getDocs(decadeQuery);
        const thisDecadeListTypesIds = decadeSnap.docs.map((item) => item.id);
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
        setGList((prevState) => [
          ...prevState,
          {
            ...newGeneralList,
            idListType: newGeneralList.idListType.path,
          },
        ]);
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

        const tmp = [
          ...gList,
          { ...newGeneralList, idListType: newGeneralList.idListType.path },
        ].sort((a, b) => (b.idListType < a.idListType ? 1 : -1));
        setGList(tmp);
      }
      toast("success", "Criado com sucesso");
      setListName("");
      decadeSelectRef.current.value = "";
    } catch (err) {
      clearLoading();
      toast("error", err.message);
    }
    clearLoading();
  }

  return (
    <Flex
      bg="gray.800"
      py={{ base: "2", md: "4" }}
      px={{ base: "4", md: "6" }}
      mb="4"
      borderRadius={6}
      as="form"
      justify={{ base: "center", sm: "flex-start" }}
      align="center"
      alignSelf={{ base: "", sm: "flex-start" }}
    >
      <Flex
        justify="center"
        align="center"
        flexDir={{ base: "column", sm: "row" }}
      >
        <FormControl>
          <FormLabel fontSize={{ base: "sm", md: "md" }}>
            Nome da lista
          </FormLabel>
          <Input
            size={{ base: "sm", md: "md" }}
            bg="gray.900"
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
          />
        </FormControl>
        <FormControl mx="4" py={{ base: "4", md: "0" }}>
          <FormLabel fontSize={{ base: "sm", md: "md" }}>Década</FormLabel>
          <Select
            size={{ base: "sm", md: "md" }}
            ref={decadeSelectRef}
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
        <CustomButton
          alignSelf="flex-end"
          buttonType="primary"
          type="button"
          px={6}
          onClick={handleNewListType}
        >
          Criar
        </CustomButton>
      </Flex>
    </Flex>
  );
}
