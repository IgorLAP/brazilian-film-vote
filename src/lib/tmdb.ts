import axios from "axios";

export const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  params: {
    language: "pt-BR",
    api_key: process.env.NEXT_PUBLIC_TMDB_KEY,
    include_adult: false,
  },
});
