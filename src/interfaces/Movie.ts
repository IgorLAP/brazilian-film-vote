import { Voters } from "./Voters";

export interface Movie {
  name: string;
  id: number | "No ID";
  points: number;
}

export interface GLMovie extends Movie {
  voters: Voters[];
}
