import { DocumentData, DocumentReference } from "firebase/firestore";

import { GLMovie } from "./Movie";

export interface GeneralListI {
  idListType: DocumentReference<DocumentData>;
  movies?: GLMovie[];
  status?: boolean;
}

type Omitter = Omit<GeneralListI, "idListType">;

export interface ExhibitGeneralListI extends Required<Omitter> {
  idListType: string;
}
