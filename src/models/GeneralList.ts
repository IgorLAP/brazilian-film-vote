import { DocumentData, DocumentReference } from "firebase/firestore";

import { Movie } from "~/interfaces/Movie";

interface GeneralListI {
  idListType: DocumentReference<DocumentData>;
  movies?: Movie[];
  status?: boolean;
}

export class GeneralList {
  idListType: DocumentReference<DocumentData>;

  movies: Movie[];

  status: boolean;

  constructor({ idListType, movies = [], status = true }: GeneralListI) {
    this.idListType = idListType;
    this.movies = movies;
    this.status = status;
  }
}
