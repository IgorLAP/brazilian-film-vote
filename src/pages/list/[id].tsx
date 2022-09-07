import React, { useContext, useEffect, useState } from "react";

import { Flex, Heading, Spinner, Button, Tooltip } from "@chakra-ui/react";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { GeneralMovieList } from "~/components/List/GeneralMovieList";
import { LoadingContext } from "~/contexts/LoadingContext";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { useToast } from "~/hooks/useToast";
import { ExhibitGeneralListI } from "~/interfaces/GeneralList";
import { GLMovie } from "~/interfaces/Movie";
import { TmdbMovie, TmdbMovieCredit } from "~/interfaces/Tmdb";
import { adminDb } from "~/lib/firebase-admin";
import { tmdbApi } from "~/lib/tmdb";

interface ListProps {
  generalList: ExhibitGeneralListI;
  listType: {
    decade: string;
    name: string;
  };
}

interface GeneralMovieList extends GLMovie {
  director: string;
  poster_path: string;
  original_title: string;
  release_date: string;
}

export default function List({ generalList, listType }: ListProps) {
  const { clearLoading } = useContext(LoadingContext);

  const toast = useToast();

  const [movieList, setMovieList] = useState<GeneralMovieList[]>([]);
  const [paginationList, setPaginationList] = useState<GeneralMovieList[]>([]);
  const [allPages, setAllPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadList() {
      try {
        const dirPromises = generalList.movies.map((movie) => {
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
        const posterYearsPromises = generalList.movies.map((movie) => {
          if (movie.id === "No ID") {
            return new Promise<TmdbMovie>((resolve) => {
              resolve({
                original_title: movie.name,
                poster_path: "/images/poster_placeholder.jpg",
                release_date: String(movie?.year),
              });
            });
          }
          return tmdbApi
            .get<TmdbMovie>(`movie/${movie.id}`)
            .then((results) => ({
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
          id: generalList.movies[index].id,
          name: generalList.movies[index].name,
          points: generalList.movies[index].points,
          poster_path: posterYears[index].poster_path,
          original_title: posterYears[index].original_title,
          release_date: posterYears[index].release_date,
          voters: generalList.movies[index].voters,
        }));
        setMovieList(moviesWithDirectors);
        const pages = Math.ceil(moviesWithDirectors.length / 24);
        setAllPages(pages);
        setPaginationList(moviesWithDirectors.slice(0, 24));
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast("error", "Erro na exibição, recarregue a página");
      }
    }
    loadList();
    clearLoading();
  }, [generalList]);

  async function handleGenerateCSVFile() {
    try {
      const onlyIdAndName = movieList.map((movie) => ({
        id: movie.id,
        name: movie.original_title,
      }));
      const { data } = await axios.post("/api/csv", {
        list: onlyIdAndName,
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${listType.decade}_${listType.name.trim().replaceAll(" ", "_")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast("error", err.message);
    }
  }

  const title = `${listType.name} - Brazilian Film Vote`;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Flex flexDir="column">
        <Heading
          fontSize={{ base: "2xl", md: "4xl" }}
          textAlign="center"
          as="h1"
        >
          {listType.decade} - {listType.name}
        </Heading>
        <Tooltip
          bg="black"
          color="white"
          placement="top"
          label="Importe listas de arquivos .csv no Letterboxd"
        >
          <Button
            size={{ base: "sm", md: "md" }}
            mt={{ base: "10", sm: "0" }}
            mb={{ base: "-10", sm: "0" }}
            alignSelf="flex-end"
            variant="ghost"
            onClick={handleGenerateCSVFile}
          >
            Exportar como CSV
          </Button>
        </Tooltip>
        {!loading && paginationList.length >= 0 ? (
          <GeneralMovieList
            paginationList={paginationList}
            movieList={movieList}
            allPages={allPages}
            setPaginationList={setPaginationList}
          />
        ) : (
          <Spinner alignSelf="center" mt="12" size="lg" color="blue.500" />
        )}
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async ({ params }) => {
    const { id } = params;

    const generalListSnap = await adminDb
      .collection("general_list")
      .doc(id as string)
      .get();

    if (!generalListSnap.exists) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const generalList = generalListSnap.data();

    if (generalList.status || generalList.movies.length <= 0) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const listType = (
      await adminDb
        .collection("list_type")
        .doc(generalList.id_list_type.path.split("/")[1])
        .get()
    ).data();

    return {
      props: {
        generalList: {
          idListType: generalList.id_list_type.path,
          movies: generalList.movies,
          status: generalList.status,
        },
        listType: {
          decade: listType.decade,
          name: listType.name,
        },
      },
    };
  }
);
