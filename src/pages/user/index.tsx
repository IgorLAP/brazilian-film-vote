import React, { useContext, useState, useEffect } from "react";

import {
  Box,
  Flex,
  Heading,
  Spinner,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { CustomButton } from "~/components/CustomButton";
import { NextPrevPagination } from "~/components/NextPrevPagination";
import { Table } from "~/components/Table";
import { PersonalListModal } from "~/components/User/PersonalListModal";
import AuthContext from "~/contexts/AuthContext";
import { LoadingContext } from "~/contexts/LoadingContext";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { useToast } from "~/hooks/useToast";
import { Movie, ShowMovie } from "~/interfaces/Movie";
import { TmdbMovie, TmdbMovieCredit } from "~/interfaces/Tmdb";
import { adminDb, auth } from "~/lib/firebase-admin";
import { tmdbApi } from "~/lib/tmdb";

interface MyListsProps {
  lists?: {
    name: string;
    idListType: string;
    movies: Movie[];
    points: number;
  }[];
  pagination: {
    allPages: number;
  };
}

export default function MyLists({ lists, pagination }: MyListsProps) {
  const router = useRouter();

  const { user } = useContext(AuthContext);
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [userList, setUserList] = useState(lists);
  const [selectedMovieList, setSelectedMovieList] = useState<ShowMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [actualPage, setActualPage] = useState(1);
  const [firstPageItem, setFirstPageItem] = useState<typeof lists>([]);
  const [lastPageItem, setLastPageItem] = useState<typeof lists>([]);

  useEffect(() => {
    const { redirect } = router.query;
    if (redirect) {
      clearLoading();
      toast("warn", "Sua votação já foi finalizada");
    }
  }, []);

  async function handleSeeList(movieList: Movie[]) {
    handleLoading(45, 1000);
    try {
      const dirPromises = movieList.map((movie) => {
        if (movie.id === "No ID") {
          return new Promise<{ name: string }>((resolve) => {
            resolve({
              name: movie?.director,
            });
          });
        }
        return tmdbApi
          .get<TmdbMovieCredit>(`movie/${movie.id}/credits`)
          .then((results) =>
            results.data.crew
              .filter((member) => member.job === "Director")
              .pop()
          );
      });
      const posterYearsPromises = movieList.map((movie) => {
        if (movie.id === "No ID") {
          return new Promise<TmdbMovie>((resolve) => {
            resolve({
              original_title: movie.name,
              poster_path: "/images/poster_placeholder.jpg",
              release_date: String(movie?.year),
            });
          });
        }

        return tmdbApi.get<TmdbMovie>(`movie/${movie.id}`).then((results) => ({
          original_title: results.data.original_title,
          poster_path: results.data.poster_path,
          release_date: results.data.release_date,
        }));
      });
      const directors = await Promise.all(dirPromises).then(
        (results) => results
      );
      const posterYears = await Promise.all(posterYearsPromises).then(
        (results) => results
      );
      const moviesWithDirectors = directors.map((item, index) => ({
        director: item?.name,
        id: movieList[index].id,
        name: movieList[index].name,
        points: movieList[index].points,
        poster_path: posterYears[index].poster_path,
        original_title: posterYears[index].original_title,
        release_date: posterYears[index].release_date,
      }));
      setSelectedMovieList(moviesWithDirectors);
      clearLoading();
      onOpen();
    } catch (err) {
      clearLoading();
      toast("error", err.message);
    }
  }

  async function handleNextPage() {
    try {
      setLoading(true);
      const last = userList.at(-1);
      const { data } = await axios.post("/api/lists-pagination", {
        startAfter: last.idListType.split("/")[1],
        collection: `users/${user?.uid}/lists`,
      });
      setLastPageItem((prev) => [...prev, userList.at(-1)]);
      setFirstPageItem((prev) => [...prev, userList[0]]);
      setUserList(data.page as typeof lists);
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
        collection: `users/${user?.uid}/lists`,
      });
      setUserList(data.page as typeof lists);
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

  const title = `Minhas Listas - ${user?.name ?? ""}`;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {!userList ? (
        <Heading>Ainda não há listas</Heading>
      ) : (
        <Box mx={{ base: "4", xl: "0" }}>
          <Heading as="h1" size={{ base: "lg", sm: "xl" }}>
            Minhas Listas
          </Heading>
          {!loading && (
            <Table
              my="8"
              variant="striped"
              tableHeaders={["Década", "Nome", "Filmes"]}
            >
              {userList.map((list) => (
                <Tr key={list.idListType}>
                  <Td>{list.idListType.split("/")[1].split("-")[0]}</Td>
                  <Td>{list.name}</Td>
                  <Td>
                    <CustomButton
                      size={{ base: "sm", md: "md" }}
                      buttonType="primary"
                      onClick={() => handleSeeList(list.movies)}
                    >
                      Ver Lista
                    </CustomButton>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
          {loading && (
            <Flex justify="center" align="center">
              <Spinner size="lg" mt="4" color="blue.500" />
            </Flex>
          )}
          {actualPage > 1 && (
            <NextPrevPagination
              actualPage={actualPage}
              allPages={pagination.allPages}
              handleNextPage={handleNextPage}
              handlePrevPage={handlePrevPage}
            />
          )}
          <PersonalListModal
            isOpen={isOpen}
            onClose={onClose}
            movieList={selectedMovieList}
          />
        </Box>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async ({ req }) => {
    const { token } = req.cookies;
    const { uid } = await auth.verifyIdToken(token);
    const userListsSnap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("lists")
      .limit(20)
      .get();
    const allLists = (
      await adminDb.collection("users").doc(uid).collection("lists").get()
    ).docs.length;

    if (!userListsSnap.empty) {
      const listTypesSnap = await adminDb.collection("list_type").get();
      const formattedData = userListsSnap.docs.map((item, index) => {
        if (
          listTypesSnap.docs[index].id ===
          item.data().id_list_type.path.split("/")[1]
        ) {
          return {
            name: listTypesSnap.docs[index].data().name,
            movies: item.data().movies,
            idListType: item.data().id_list_type.path,
          };
        }
        return {};
      });
      return {
        props: {
          lists: formattedData,
          pagination: {
            allPages: Math.ceil(allLists / 20),
          },
        },
      };
    }

    return {
      props: {},
    };
  }
);
