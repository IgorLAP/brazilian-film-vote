import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

import {
  Button,
  Flex,
  FormControl,
  Icon,
  Input,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";

import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { db as webDb } from "~/lib/firebase";
import { db, firebaseAdmin } from "~/lib/firebase-admin";

interface Users {
  name?: string;
  email: string;
}

interface AdminProps {
  users: Users[];
}

const actionCodeSetting = {
  url: `${process.env.NEXT_PUBLIC_SITE_URL}/signin`,
  handleCodeInApp: true,
};

export default function Admin({ users }: AdminProps) {
  const [usersList, setUsersList] = useState(users);
  const [newUserEmail, setNewUserEmail] = useState("");

  async function handleNewUser() {
    const auth = getAuth();
    try {
      const alreadyExistsEmail = usersList.filter(
        (user) => user.email === newUserEmail
      );
      if (alreadyExistsEmail.length === 0) {
        await sendSignInLinkToEmail(auth, newUserEmail, actionCodeSetting);
        alert("Email enviado");
        setNewUserEmail("");
      } else {
        alert("Email já cadastrado");
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteUser(email: string) {
    const q = query(collection(webDb, "users"), where("email", "==", email));
    const querySnap = await getDocs(q);
    const [userID] = querySnap.docs.map((i) => i.id);
    await deleteDoc(doc(webDb, "users", userID));
    setUsersList((prevState) =>
      prevState.filter((user) => user.email !== email)
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <Flex w="100%" flexDir="column">
        <Stack spacing="4" borderRadius="4">
          <Button
            bg="blue.400"
            alignSelf="flex-start"
            _hover={{ bg: "blue.400" }}
            disabled={!newUserEmail}
            onClick={handleNewUser}
          >
            Enviar email de cadastro
          </Button>
          <FormControl w="420px">
            <Input
              bg="white"
              color="black"
              _placeholder={{ color: "gray.500" }}
              type="email"
              placeholder="E-mail"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
          </FormControl>
        </Stack>
        <TableContainer mt="8" w="100%">
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {usersList.map((user) => (
                <Tr key={user.email}>
                  <Td>{user?.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Button
                      bg="red.500"
                      _hover={{ bg: "red.600" }}
                      onClick={() => handleDeleteUser(user.email)}
                    >
                      <Icon as={FiTrash2} />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = verifySSRAuth(
  async ({ req }) => {
    const { token } = req.cookies;
    const auth = firebaseAdmin.auth();
    const { uid } = await auth.verifyIdToken(token);
    const { customClaims } = await auth.getUser(uid);

    if (!customClaims?.admin) {
      await auth.setCustomUserClaims(uid, { admin: true });
    }

    const usersRef = db.collection("users");
    const users = await usersRef.get();

    return {
      props: {
        users: users.docs.map((user) => user.data()),
      },
    };
  }
);
