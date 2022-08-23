import React from "react";

import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { GetServerSideProps } from "next";

import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { ExhibitGeneralListI } from "~/interfaces/GeneralList";
import { db } from "~/lib/firebase-admin";

interface ListProps {
  generalList: ExhibitGeneralListI;
  listType: {
    decade: string;
    name: string;
  };
}

export default function List({ generalList, listType }: ListProps) {
  return (
    <Grid gridTemplateColumns="repeat(2,1fr)">
      {generalList.movies.map((movie) => (
        <Flex key={movie.name}>
          <Box>
            <Text>{movie.name}</Text>
            <Text>{movie.points}</Text>
            {movie.voters.map((voter) => (
              <Text key={voter.place}>
                {voter.place}: {voter.name.join(",")}
              </Text>
            ))}
          </Box>
        </Flex>
      ))}
    </Grid>
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

    // if (!generalList.status) {
    //   return {
    //     redirect: {
    //       destination: "/",
    //       permanent: false,
    //     },
    //   };
    // }

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
