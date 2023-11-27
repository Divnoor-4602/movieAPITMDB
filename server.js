import dotenv from "dotenv";
import app from "./app/index.js";
import Axios from "axios";

dotenv.config();
// bearer authorization token
const authorization = process.env["AUTHENTICATION_TOKEN"];

// assigning a port
const port = 3000;

// setting up essentials for TMDB API
const movieUrl = "https://api.themoviedb.org/3/movie/now_playing";

const movieParams = {
  language: "en-US",
  page: 2,
  region: "US",
};

const headers = {
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZWIxYzczZGY4YjE4NjZkMTk1N2FmNjUyMzViMTg0ZSIsInN1YiI6IjY0OTVkNDhiZDIzNmU2MDExZTBhMjE1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-lBefPNKUf-JMm20mfpdXZtxwnR-KvRxyYyB864-fYA",
};

// setting up show get req params and header
const showsUrl = "https://api.themoviedb.org/3/tv/top_rated";

const showParams = {
  language: "en-US",
  page: 2,
};

// youtube uri to retrieve the trailer of the movies and pass them onto the json object
const youtubeUrl = "https://www.youtube.com/watch?v=";

/**
 *
 * @param {*} movies: takes in a movie list from the movies extractor
 * @return {*}
 */
async function getVideosProviders(movies, type) {
  const newMovieObject = [];

  for (const movie of movies) {
    //  getting the id of the movie

    // Getting the videos for the trailers
    let videosEndpoint = "";
    if (type == "movie") {
      const movieId = movie.movie_id;
      videosEndpoint = `https://api.themoviedb.org/3/movie/${movieId}/videos`;
    } else {
      const showId = movie.show_id;
      videosEndpoint = `https://api.themoviedb.org/3/tv/${showId}/videos`;
    }
    // making an axios request to get movie results JSON
    const movieResponse = await Axios.get(videosEndpoint, { headers });

    for (const videoResponse of movieResponse.data["results"]) {
      if (videoResponse.type == "Trailer" && videoResponse.site == "YouTube") {
        let youtubeUrlToPass = youtubeUrl + videoResponse.key;
        if (type == "movie") {
          movie["movie_youtube_url"] = youtubeUrlToPass;
        } else {
          movie["show_youtube_url"] = youtubeUrlToPass;
        }
      }
    }
    newMovieObject.push(movie);
  }
  return newMovieObject;
}

/**
 *
 * Takes the movie list and returns the genre
 * @param {*} movieToExtract
 * @return {*}
 */
function genreExtract(movieToExtract) {
  let [genre1, genre2] = movieToExtract.genre_ids;
  let genreOneName, genreTwoName;

  genreList.forEach((genre) => {
    if (genre.id == genre1) {
      genreOneName = genre.name;
    }
  });

  genreList.forEach((genre) => {
    if (genre.id == genre2) {
      genreTwoName = genre.name;
    }
  });

  return [genreOneName, genreTwoName];
}

/***
 * This function is used to extract all the important details to send further
 * @param moviesData: the movie response recieved from the axios request in the get path
 */
async function movieDetails(moviesData) {
  const moviesListToSend = [];

  await moviesData["results"].forEach((movie) => {
    // fetching movie genres
    const [genreTitle1, genreTitle2] = genreExtract(movie);

    // fetching movie id
    const movieId = movie.id;

    // movie title
    const movieTitle = movie.title;

    //  movie description
    const movieDescription = movie.overview;

    //   movie poster
    const moviePoster = movie.poster_path;

    // vote avergae ratings
    const movieRatings = movie.vote_average;

    // getting the release data
    const movieReleaseDate = movie.release_date;

    // getting the orignal language
    const movieLang = movie.orignal_language;

    const movieObj = {
      movie_title: movieTitle,
      genre_1: genreTitle1,
      genre_2: genreTitle2,
      movie_id: movieId,
      movie_poster_path: moviePoster,
      movie_desc: movieDescription,
      movie_ratings: movieRatings,
      movie_release_date: movieReleaseDate,
      movie_language: movieLang,
    };

    moviesListToSend.push(movieObj);
  });

  const movieObjectToSend = await getVideosProviders(moviesListToSend, "movie");

  return { movies: movieObjectToSend };
}

/***
 * Extracts all the required shows data and passes it on
 */
async function showDetails(showsData) {
  const showsToSend = [];

  await showsData["results"].forEach((show) => {
    // getting show genre
    const [genreName1, genreName2] = genreExtract(show);

    // name
    const showName = show.name;

    // show id
    const showId = show.id;

    // show description
    const showDesc = show.overview;

    const showPoster = show.poster_path;

    // show ratings
    const showRatings = show.vote_average;

    // show release date
    const showReleaseDate = show.first_air_date;

    const showobj = {
      show_title: showName,
      genre_1: genreName1,
      genre_2: genreName2,
      show_id: showId,
      show_poster_path: showPoster,
      show_desc: showDesc,
      show_ratings: showRatings,
      release_date: showReleaseDate,
    };
    showsToSend.push(showobj);
  });

  // todo: get show videos, ratings, release dat, video

  const newShowObject = await getVideosProviders(showsToSend);

  return { shows: newShowObject };
}

// listening on port
app.listen(port, () => {
  console.log("Listening on " + port);
});

// getting list of genres for all movies
const genParam = { language: "en" };
const genreResponse = await Axios.get(
  "https://api.themoviedb.org/3/genre/movie/list",
  { genParam, headers }
);
const genreList = genreResponse.data["genres"];

// getting list of currently playing movies
app.get("/currentMovies", async (req, res) => {
  try {
    const movieResponse = await Axios.get(movieUrl, { movieParams, headers });

    // extracting details
    const movieDetailsToSend = await movieDetails(movieResponse.data);

    //  extracting youtube video links

    res.json(movieDetailsToSend);
  } catch (error) {
    console.log(error);
  }
});

// getting list of current on air shows
app.get("/currentShows", async (req, res) => {
  try {
    const showResponse = await Axios.get(showsUrl, { showParams, headers });

    // extracting show details
    const showDetailsToSend = await showDetails(showResponse.data);

    // getting the youtube video links

    res.json(showDetailsToSend);
  } catch (error) {
    console.log(error);
  }
});
