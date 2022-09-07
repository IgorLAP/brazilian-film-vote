import React, { useContext } from "react";

import { Icon, Td, Tr } from "@chakra-ui/react";
import axios from "axios";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FiTrash2 } from "react-icons/fi";
import { RiFileUserFill } from "react-icons/ri";

import { Table } from "~/components/Table";
import { LoadingContext } from "~/contexts/LoadingContext";
import { showAlert } from "~/helpers/showAlert";
import { useToast } from "~/hooks/useToast";
import { GeneralListI } from "~/interfaces/GeneralList";
import { Movie } from "~/interfaces/Movie";
import { User } from "~/interfaces/User";
import { webDb } from "~/lib/firebase";

import { CustomButton } from "../CustomButton";

interface UserList extends Omit<GeneralListI, "movies"> {
  movies?: Movie[];
}

interface UsersListsTableProps {
  usersList: User[];
  onOpen: () => void;
  setModalList: React.Dispatch<React.SetStateAction<UserList[]>>;
  setUsersList: React.Dispatch<React.SetStateAction<User[]>>;
}

export function UsersListsTable({
  usersList,
  onOpen,
  setModalList,
  setUsersList,
}: UsersListsTableProps) {
  const { handleLoading, clearLoading } = useContext(LoadingContext);

  const toast = useToast();

  async function handleSeeUsersList(email: string) {
    handleLoading(30, 1000);
    try {
      const q = query(collection(webDb, "users"), where("email", "==", email));
      const [user] = (await getDocs(q)).docs;
      const usersListsRef = collection(webDb, `users/${user.id}/lists`);
      const listq = query(usersListsRef);
      const usersLists = await getDocs(listq);
      if (usersLists.empty) {
        clearLoading();
        toast("warn", "Usuário não possui listas");
        return;
      }
      setModalList(
        usersLists.docs.map((item) => ({
          idListType: item.data().id_list_type,
          movies: item.data().movies,
          status: item.data().status,
        })) as GeneralListI[]
      );
      onOpen();
    } catch (err) {
      toast("error", "Erro ao carregar informações");
    }
    clearLoading();
  }

  async function handleDeleteUser(email: string) {
    try {
      const { isConfirmed } = await showAlert({
        title: "Confirmar ação",
        text: `Deletar usuário de email: ${email}?`,
      });
      if (!isConfirmed) return;
      handleLoading(25, 500);
      const q = query(collection(webDb, "users"), where("email", "==", email));
      const querySnap = await getDocs(q);
      const [userID] = querySnap.docs.map((i) => i.id);
      await axios.post("/api/delete-lists", { userID });
      await deleteDoc(doc(webDb, "users", userID));
      await axios.post("/api/auth-delete", { email });
      setUsersList((prevState) =>
        prevState.filter((user) => user.email !== email)
      );
      clearLoading();
      toast("success", "Deletado");
    } catch (err) {
      clearLoading();
      toast("error", err.message);
    }
  }

  return (
    <Table
      my="8"
      mx={{ base: "4", xl: "0" }}
      tableHeaders={["Nome", "Email", "Listas", "Excluir"]}
      variant="striped"
    >
      {usersList.map((user) => (
        <Tr key={user.email}>
          <Td>{user?.name}</Td>
          <Td>{user.email}</Td>
          <Td>
            <CustomButton
              w="fit-content"
              buttonType="warn"
              onClick={() => handleSeeUsersList(user.email)}
            >
              <Icon as={RiFileUserFill} />
            </CustomButton>
          </Td>
          <Td>
            <CustomButton
              w="fit-content"
              buttonType="danger"
              onClick={() => handleDeleteUser(user.email)}
            >
              <Icon as={FiTrash2} />
            </CustomButton>
          </Td>
        </Tr>
      ))}
    </Table>
  );
}
