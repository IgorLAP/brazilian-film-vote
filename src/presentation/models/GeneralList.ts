import { DocumentData, DocumentReference } from "firebase/firestore";

import { GeneralListI } from "~/presentation/interfaces/GeneralList";
import { GLMovie } from "~/presentation/interfaces/Movie";

export class GeneralList {
  idListType: DocumentReference<DocumentData>;

  movies: GLMovie[];

  status: boolean;

  constructor({ idListType, movies = [], status = true }: GeneralListI) {
    this.idListType = idListType;
    this.movies = movies;
    this.status = status;
  }
}
