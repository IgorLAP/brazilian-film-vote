import { DocumentData, DocumentReference } from "firebase/firestore";

interface GeneralListI {
  idListType: DocumentReference<DocumentData>;
  movies?: { name: string; points: number }[];
  status?: boolean;
}

export class GeneralList {
  idListType: DocumentReference<DocumentData>;

  movies: { name: string; points: number }[];

  status: boolean;

  constructor({ idListType, movies = [], status = true }: GeneralListI) {
    this.idListType = idListType;
    this.movies = movies;
    this.status = status;
  }
}
