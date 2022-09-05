import React, { useContext, useState } from "react";

import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { CustomButton } from "~/components/CustomButton";
import { NotFoundMovieModal } from "~/components/User/NotFoundMovieModal";
import { VotingGrid } from "~/components/User/VotingGrid";
import AuthContext from "~/contexts/AuthContext";
import { LoadingContext } from "~/contexts/LoadingContext";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { GLMovie, Movie } from "~/interfaces/Movie";
import { fieldName } from "~/interfaces/Voters";
import { db as webDb } from "~/lib/firebase";
import { db as adminDb, auth } from "~/lib/firebase-admin";
import { GeneralList } from "~/models/GeneralList";

interface VotingProps {
  generalList: {
    idListType: string;
    status: boolean;
  };
}

interface CompleteNotFoundMovie extends Movie {
  index: number;
}

const movieListPlaceholder: Movie[] = [
  { name: "", id: 0, points: 20 },
  { name: "", id: 0, points: 19 },
  { name: "", id: 0, points: 18 },
  { name: "", id: 0, points: 17 },
  { name: "", id: 0, points: 16 },
  { name: "", id: 0, points: 15 },
  { name: "", id: 0, points: 14 },
  { name: "", id: 0, points: 13 },
  { name: "", id: 0, points: 12 },
  { name: "", id: 0, points: 11 },
  { name: "", id: 0, points: 10 },
  { name: "", id: 0, points: 9 },
  { name: "", id: 0, points: 8 },
  { name: "", id: 0, points: 7 },
  { name: "", id: 0, points: 6 },
  { name: "", id: 0, points: 5 },
  { name: "", id: 0, points: 4 },
  { name: "", id: 0, points: 3 },
  { name: "", id: 0, points: 2 },
  { name: "", id: 0, points: 1 },
];

export default function Voting({ generalList }: VotingProps) {
  const router = useRouter();

  const { user } = useContext(AuthContext);
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [movieList, setMovieList] = useState(movieListPlaceholder);
  const [notFoundMovie, setNotFoundMovie] =
    useState<CompleteNotFoundMovie | null>();

  const isFullList = movieList.every(
    (movie) => movie.id !== 0 && movie.name !== ""
  );
  const votingDecade = Number(
    generalList.idListType.split("/")[1].split("-")[0]
  );
  const title = `Votação dos anos ${votingDecade} - ${
    user?.name.split(" ")[0]
  }`;

  function handleNotFoundMovie(inputValue: string, index: number) {
    const clone = [...movieList];
    clone[index].name = inputValue;
    const alreadyHasMovie = clone.filter(
      (item) => item.name.toLowerCase() === inputValue.toLowerCase()
    );
    if (alreadyHasMovie.length > 1) {
      showToast("warn", "Filme já adicionado");
      setMovieList(() => {
        clone[index].name = "";
        clone[index].id = 0;
        return clone;
      });
    } else {
      setNotFoundMovie({ ...clone[index], index });
      onOpen();
    }
  }

  async function handleVote() {
    handleLoading(25, 1000);
    try {
      const userListDocRef = doc(
        webDb,
        `users/${user.uid}/lists`,
        generalList.idListType.split("/")[1]
      );
      const generalListDocRef = doc(
        webDb,
        "general_list",
        generalList.idListType.split("/")[1]
      );
      const listTypeDocRef = doc(
        webDb,
        "list_type",
        `${generalList.idListType.split("/")[1]}`
      );
      await setDoc(userListDocRef, {
        id_list_type: listTypeDocRef,
        movies: movieList,
      });
      const actualGeneral = await getDoc(generalListDocRef);
      if (actualGeneral.data().movies.length > 0) {
        const { movies } = actualGeneral.data();
        const cloneMovieList = [...movieList] as GLMovie[];
        Object.keys(movies).forEach((i) => {
          Object.keys(movieList).forEach((y) => {
            if (movies[i].name === cloneMovieList[y]?.name) {
              movies[i].points += cloneMovieList[y].points;
              const movieListPlace = movieList.findIndex(
                (item) => item.name === cloneMovieList[y]?.name
              );
              movies[i].voters.forEach((voter, voteI) => {
                if (voter.place === `#${movieListPlace + 1}`) {
                  movies[i].voters[voteI].name.push(user.name);
                }
              });
              const alreadyHas = movies[i].voters.filter(
                (item) => item.place === `#${movieListPlace + 1}`
              );
              if (alreadyHas.length <= 0)
                movies[i].voters.push({
                  name: [user.name],
                  place: `#${movieListPlace + 1}`,
                });
              cloneMovieList.splice(Number(y), 1);
            }
          });
        });

        const updatedGeneralList = cloneMovieList
          .concat(movies)
          .map((item, index) => {
            if (!item.voters) {
              return {
                ...item,
                voters: [
                  {
                    name: [user.name],
                    place: `#${index + 1}`,
                  },
                ],
              };
            }
            return {
              ...item,
            };
          });
        await updateDoc(generalListDocRef, {
          movies: updatedGeneralList.sort((a, b) => b.points - a.points),
        });
      } else {
        const movies = movieList
          .sort((a, b) => b.points - a.points)
          .map((item, index) => {
            const response = {
              id: item.id,
              name: item.name,
              points: item.points,
              voters: [
                {
                  name: [`${user.name}`],
                  place: `#${index + 1}` as fieldName,
                },
              ],
            };

            if (!item.director) return response;

            return {
              ...response,
              year: item?.year,
              director: item?.director,
            };
          });
        const newGeneralList = new GeneralList({
          idListType: listTypeDocRef,
          movies,
          status: true,
        });
        await setDoc(generalListDocRef, {
          id_list_type: newGeneralList.idListType,
          movies: newGeneralList.movies,
          status: newGeneralList.status,
        });
      }
      router.push("/user");
    } catch (err) {
      clearLoading();
      showToast("error", err.message);
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Box mx={{ base: "4", lg: "0" }}>
        <Heading as="h1" size={{ base: "lg", sm: "xl" }}>
          Votação dos anos {votingDecade}
        </Heading>
        <Stack my="2" spacing="2">
          <Text
            color="red.600"
            fontSize={{ base: "xs", sm: "sm" }}
            textAlign="start"
          >
            Após digitar, confirme o voto clicando no filme escolhido
          </Text>
          <Text
            color="red.600"
            fontSize={{ base: "xs", sm: "sm" }}
            textAlign="start"
          >
            Para um filme não encontrado pela plataforma, primeiro digite e
            depois marque a opção abaixo
          </Text>
        </Stack>
        <Flex
          flexDir="column"
          bg="gray.800"
          pb={{ base: "2", lg: "4" }}
          pt={{ base: "6", lg: "8" }}
          px={{ base: "3", lg: "6" }}
          borderRadius={6}
          mt="2"
        >
          <VotingGrid
            handleNotFoundMovie={handleNotFoundMovie}
            movieList={movieList}
            setMovieList={setMovieList}
            votingDecade={votingDecade}
          />
          <CustomButton
            size={{ base: "sm", md: "md" }}
            buttonType="primary"
            mt="4"
            px="6"
            alignSelf="flex-end"
            disabled={!isFullList}
            onClick={handleVote}
          >
            Votar
          </CustomButton>
        </Flex>
      </Box>
      <NotFoundMovieModal
        notFoundMovie={notFoundMovie}
        setNotFoundMovie={setNotFoundMovie}
        isOpen={isOpen}
        onClose={onClose}
        movieList={movieList}
        setMovieList={setMovieList}
        votingDecade={votingDecade}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async ({ req }) => {
    const { token } = req.cookies;
    const generalListRef = adminDb
      .collection("general_list")
      .where("status", "==", true);
    const isVotingConcluded = (await generalListRef.get()).empty;

    if (isVotingConcluded) {
      return {
        redirect: {
          destination: "/user",
          permanent: false,
        },
      };
    }

    const [activeGList] = (await generalListRef.get()).docs;
    const activeGListId = activeGList.data().id_list_type.path;
    const activeGListStatus = activeGList.data().status;

    const actualGeneralList = {
      idListType: activeGListId,
      status: activeGListStatus,
    };

    const { uid } = await auth.verifyIdToken(token);

    const userActualList = await adminDb
      .collection("users")
      .doc(uid)
      .collection("lists")
      .doc(activeGListId.split("/")[1] as string)
      .get();

    if (userActualList.exists) {
      return {
        redirect: {
          destination: "/user?redirect=s",
          permanent: false,
        },
      };
    }

    const user = (await adminDb.collection("users").doc(uid).get()).data();
    await auth.updateUser(uid, {
      displayName: user.name,
    });

    return {
      props: {
        generalList: actualGeneralList,
      },
    };
  }
);
