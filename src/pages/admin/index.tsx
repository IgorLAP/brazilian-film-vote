import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

import {
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
import axios from "axios";
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

import { CustomButton } from "~/components/CustomButton";
import { showAlert } from "~/helpers/showAlert";
import { showToast } from "~/helpers/showToast";
import { verifySSRAuth } from "~/helpers/veritySSRAuth";
import { db as webDb } from "~/lib/firebase";
import { db } from "~/lib/firebase-admin";

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
        showToast("success", "Email enviado");
        setNewUserEmail("");
      } else {
        showToast("error", "Email já cadastrado");
      }
    } catch (err) {
      showToast("error", err.message);
    }
  }

  async function handleDeleteUser(email: string) {
    const { isConfirmed } = await showAlert({
      title: "Confirmar ação",
      text: `Deletar usuário de email: ${email}?`,
    });
    if (!isConfirmed) return;
    const q = query(collection(webDb, "users"), where("email", "==", email));
    const querySnap = await getDocs(q);
    const [userID] = querySnap.docs.map((i) => i.id);
    await deleteDoc(doc(webDb, "users", userID));
    await axios.post("/api/auth-delete", { email });
    setUsersList((prevState) =>
      prevState.filter((user) => user.email !== email)
    );
    showToast("success", "Deletado");
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Brazilian film vote</title>
      </Head>
      <Flex w="100%" flexDir="column">
        <Stack spacing="4" borderRadius="4">
          <CustomButton
            buttonType="primary"
            alignSelf="flex-start"
            disabled={!newUserEmail}
            onClick={handleNewUser}
          >
            Enviar email de cadastro
          </CustomButton>

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
                <Th>Nome</Th>
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
                    <CustomButton
                      buttonType="danger"
                      onClick={() => handleDeleteUser(user.email)}
                    >
                      <Icon as={FiTrash2} />
                    </CustomButton>
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
  async () => {
    const usersRef = db.collection("users");
    const users = await usersRef.get();

    return {
      props: {
        users: users.docs.map((user) => user.data()),
      },
    };
  }
);
