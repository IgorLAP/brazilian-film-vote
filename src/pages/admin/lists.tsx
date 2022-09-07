import React, { useState } from "react";

import { Flex, Spinner } from "@chakra-ui/react";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { CreateList } from "~/components/Admin/CreateList";
import { ManageMovieLists } from "~/components/Admin/ManageMovieLists";
import { NextPrevPagination } from "~/components/NextPrevPagination";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { useToast } from "~/hooks/useToast";
import { ExhibitGeneralListI } from "~/interfaces/GeneralList";
import { adminDb } from "~/lib/firebase-admin";
import { Decades } from "~/models/Decades";

interface ListsProps {
  generalList: ExhibitGeneralListI[];
  validDecades: number[];
  pagination: {
    allPages: number;
  };
}

export default function Lists({
  generalList,
  validDecades,
  pagination,
}: ListsProps) {
  const toast = useToast();

  const [gList, setGList] = useState(generalList);
  const [loading, setLoading] = useState(false);
  const [actualPage, setActualPage] = useState(1);
  const [firstPageItem, setFirstPageItem] = useState<ExhibitGeneralListI[]>([]);
  const [lastPageItem, setLastPageItem] = useState<ExhibitGeneralListI[]>([]);

  async function handleNextPage() {
    try {
      setLoading(true);
      const last = gList.at(-1);
      const { data } = await axios.post("/api/lists-pagination", {
        startAfter: last.idListType.split("/")[1],
        collection: "general_list",
      });
      setLastPageItem((prev) => [...prev, gList.at(-1)]);
      setFirstPageItem((prev) => [...prev, gList[0]]);
      setGList(data.page as ExhibitGeneralListI[]);
      setActualPage((prev) => prev + 1);
    } catch (err) {
      toast("error", "Erro no carregamento");
    }
    setLoading(false);
  }

  async function handlePrevPage() {
    try {
      setLoading(true);
      const firstPageLast = firstPageItem.at(-1).idListType.split("/")[1];
      const lastPageLast = lastPageItem.at(-1).idListType.split("/")[1];
      const { data } = await axios.post("/api/lists-pagination", {
        startAt: firstPageLast,
        endAt: lastPageLast,
        collection: "general_list",
      });
      setGList(data.page as ExhibitGeneralListI[]);
      setLastPageItem((prev) =>
        prev.filter((item) => item.idListType.split("/")[1] !== lastPageLast)
      );
      setFirstPageItem((prev) =>
        prev.filter((item) => item.idListType.split("/")[1] !== firstPageLast)
      );
      setActualPage((prev) => prev - 1);
    } catch (err) {
      toast("error", "Erro no carregamento");
    }
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Listas - Brazilian Film Vote</title>
      </Head>
      <Flex mx={{ base: "4", xl: "0" }} flexDir="column">
        <CreateList
          gList={gList}
          setGList={setGList}
          validDecades={validDecades}
        />
        {gList.length > 0 && !loading && (
          <ManageMovieLists gList={gList} setGList={setGList} />
        )}
        {loading && (
          <Spinner size="lg" alignSelf="center" mt="4" color="blue.500" />
        )}
        {pagination.allPages > 1 && (
          <NextPrevPagination
            actualPage={actualPage}
            allPages={pagination.allPages}
            handleNextPage={handleNextPage}
            handlePrevPage={handlePrevPage}
          />
        )}
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async () => {
    const generalList = await adminDb
      .collection("general_list")
      .limit(20)
      .get();
    const allPages = (await adminDb.collection("general_list").get()).docs
      .length;

    const decadesRef = adminDb.collection("decades");
    const decadesSnap = await decadesRef.get();
    if (decadesSnap.empty) {
      const decades = new Decades();
      adminDb.collection("decades").doc("valid_decades").set({
        availables: decades.valid_decades.availables,
      });
    }
    const [validDecades] = decadesSnap.docs.map((year) => year.data());

    return {
      props: {
        generalList: generalList.docs.map((item) => ({
          movies: item.data().movies,
          idListType: item.data().id_list_type.path,
          status: item.data().status,
        })),
        validDecades: validDecades.availables,
        pagination: {
          allPages: Math.ceil(allPages / 20),
        },
      },
    };
  }
);
