import { Voters } from "./Voters";

export interface Movie {
  name: string;
  id: number | "No ID";
  points: number;
  director?: string;
  year?: number;
}

export interface ShowMovie extends Movie {
  director: string;
  poster_path: string;
  original_title: string;
  release_date: string;
}

export interface GLMovie extends Movie {
  voters: Voters[];
}
