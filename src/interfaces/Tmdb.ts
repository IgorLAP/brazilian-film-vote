export interface TmdbMovie {
  original_title: string;
  poster_path: string;
  release_date: string;
}

export interface TmdbMovieCredit {
  crew: {
    job: "Director";
    name: string;
  }[];
}
