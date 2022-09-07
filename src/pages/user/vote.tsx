import React, { useContext } from "react";

import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { Voting } from "~/components/User/Voting";
import AuthContext from "~/contexts/AuthContext";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { adminDb, auth } from "~/lib/firebase-admin";

interface VoteProps {
  generalList: {
    idListType: string;
    status: boolean;
  };
}

export default function Vote({ generalList }: VoteProps) {
  const { user } = useContext(AuthContext);

  const votingDecade = Number(
    generalList.idListType.split("/")[1].split("-")[0]
  );
  const title = `Votação dos anos ${votingDecade} - ${
    user?.name.split(" ")[0]
  }`;

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
          <Voting
            idListType={generalList.idListType}
            votingDecade={votingDecade}
          />
        </Flex>
      </Box>
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
