import React, { useState, useContext } from "react";

import { useDisclosure } from "@chakra-ui/react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

import { CustomButton } from "~/components/CustomButton";
import { NotFoundMovieModal } from "~/components/User/Voting/NotFoundMovieModal";
import { VotingGrid } from "~/components/User/Voting/VotingGrid";
import AuthContext from "~/contexts/AuthContext";
import { LoadingContext } from "~/contexts/LoadingContext";
import { useToast } from "~/hooks/useToast";
import { GLMovie, Movie } from "~/interfaces/Movie";
import { fieldName } from "~/interfaces/Voters";
import { webDb } from "~/lib/firebase";
import { GeneralList } from "~/models/GeneralList";

interface CompleteNotFoundMovie extends Movie {
  index: number;
}

interface VotingProps {
  votingDecade: number;
  idListType: string;
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

export function Voting({ votingDecade, idListType }: VotingProps) {
  const router = useRouter();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(AuthContext);
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const toast = useToast();

  const [movieList, setMovieList] = useState(movieListPlaceholder);
  const [notFoundMovie, setNotFoundMovie] =
    useState<CompleteNotFoundMovie | null>();

  function handleNotFoundMovie(inputValue: string, index: number) {
    const clone = [...movieList];
    clone[index].name = inputValue;
    const alreadyHasMovie = clone.filter(
      (item) => item.name.toLowerCase() === inputValue.toLowerCase()
    );
    if (alreadyHasMovie.length > 1) {
      toast("warn", "Filme já adicionado");
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
        idListType.split("/")[1]
      );
      const generalListDocRef = doc(
        webDb,
        "general_list",
        idListType.split("/")[1]
      );
      const listTypeDocRef = doc(
        webDb,
        "list_type",
        `${idListType.split("/")[1]}`
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
      toast("error", err.message);
    }
  }

  const isFullList = movieList.every(
    (movie) => movie.id !== 0 && movie.name !== ""
  );

  return (
    <>
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
      <NotFoundMovieModal
        isOpen={isOpen}
        movieList={movieList}
        notFoundMovie={notFoundMovie}
        onClose={onClose}
        setMovieList={setMovieList}
        setNotFoundMovie={setNotFoundMovie}
        votingDecade={votingDecade}
      />
    </>
  );
}
