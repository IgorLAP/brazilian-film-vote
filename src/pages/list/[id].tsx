import React, { useEffect, useState } from "react";

import {
  Flex,
  Grid,
  Text,
  Heading,
  Image,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { MovieDetail } from "~/components/MovieDetail";
import { Pagination } from "~/components/Pagination";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { ExhibitGeneralListI } from "~/interfaces/GeneralList";
import { GLMovie } from "~/interfaces/Movie";
import { db } from "~/lib/firebase-admin";
import { tmdbApi } from "~/lib/tmdb";

interface ListProps {
  generalList: ExhibitGeneralListI;
  listType: {
    decade: string;
    name: string;
  };
}

interface TmdbMovieCredit {
  crew: {
    job: "Director";
    name: string;
  }[];
}

interface TmdbMovie {
  original_title: string;
  poster_path: string;
  release_date: string;
}

interface GeneralMovieList extends GLMovie {
  director: string;
  poster_path: string;
  original_title: string;
  release_date: string;
}

export default function List({ generalList, listType }: ListProps) {
  const [movieList, setMovieList] = useState<GeneralMovieList[]>([]);
  const [paginationList, setPaginationList] = useState<GeneralMovieList[]>([]);
  const [pagination, setPagination] = useState(1);
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
        showToast("error", "Erro na exibição, recarregue a página");
      }
    }
    loadList();
  }, []);

  function handlePrevPage(page: number) {
    setPagination(page);
    setPaginationList(movieList.slice(page * 24 - 24, page * 24));
  }

  function handleNextPage(page: number) {
    setPagination(page);
    setPaginationList(movieList.slice(page * 24 - 24, page * 24));
  }

  const posterPathBase = "https://image.tmdb.org/t/p/w185";

  return (
    <>
      <Head>
        <title>{listType.name} - Brazilian film vote</title>
      </Head>
      <Flex flexDir="column">
        <Heading textAlign="center" as="h1">
          {listType.decade} - {listType.name}
        </Heading>
        {!loading && paginationList.length >= 0 ? (
          <>
            <Grid
              my="6"
              rowGap="8"
              columnGap="4"
              gridTemplateColumns="repeat(2,1fr)"
            >
              {paginationList.map((movie) => (
                <Flex key={movie.original_title}>
                  <Image
                    h="280px"
                    w="190px"
                    src={
                      movie.id === "No ID"
                        ? movie.poster_path
                        : posterPathBase + movie.poster_path
                    }
                    objectFit="cover"
                    objectPosition="center"
                    borderRadius={6}
                    border="2px"
                    borderColor="blue.500"
                    mr="2"
                  />
                  <Flex
                    flexDir="column"
                    align="flex-start"
                    overflowY="scroll"
                    h="320"
                    css={{
                      "&::-webkit-scrollbar": {
                        width: "3px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(48, 130, 206, .7)",
                        borderRadius: "12px",
                      },
                    }}
                  >
                    <Stack display="flex" alignItems="flex-start" spacing="2">
                      <MovieDetail field="Título" value={movie.name} />
                      <MovieDetail field="Pontos" value={movie.points} />
                      <MovieDetail field="Diretor" value={movie.director} />
                      <MovieDetail
                        field="Ano"
                        value={movie.year ?? movie.release_date.split("-")[0]}
                      />
                      {movie.voters
                        .sort(
                          (a, b) =>
                            Number(a.place.at(-1)) - Number(b.place.at(-1))
                        )
                        .map((voter, i) => (
                          <Text
                            fontSize="md"
                            letterSpacing="wide"
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${i}${voter.name[0]}`}
                          >
                            {voter.place}: {voter.name.join(", ")}
                          </Text>
                        ))}
                    </Stack>
                  </Flex>
                </Flex>
              ))}
            </Grid>
            <Pagination
              allPages={allPages}
              handleNextPage={handleNextPage}
              handlePrevPage={handlePrevPage}
              actualPage={pagination}
            />
          </>
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

    const generalListSnap = await db
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

    if (!generalList.status || generalList.movies.length <= 0) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const listType = (
      await db
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
