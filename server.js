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
  page: 1,
  region: "IN",
};

const headers = {
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZWIxYzczZGY4YjE4NjZkMTk1N2FmNjUyMzViMTg0ZSIsInN1YiI6IjY0OTVkNDhiZDIzNmU2MDExZTBhMjE1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-lBefPNKUf-JMm20mfpdXZtxwnR-KvRxyYyB864-fYA",
};

// setting up show get req params and header
const showsUrl = "https://api.themoviedb.org/3/tv/on_the_air";

const showParams = {
  language: "en-US",
  page: 1,
};

/***
 * Gets the genre names of the given movie
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

    const movieObj = {
      movie_title: movieTitle,
      genre_1: genreTitle1,
      genre_2: genreTitle2,
      movie_id: movieId,
      movie_poster_path: moviePoster,
      movie_desc: movieDescription,
    };

    moviesListToSend.push(movieObj);
  });

  return { movies: moviesListToSend };
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

    const showobj = {
      show_title: showName,
      genre_1: genreName1,
      genre_2: genreName2,
      show_id: showId,
      show_poster_path: showPoster,
      show_desc: showDesc,
    };
    showsToSend.push(showobj);
  });
  return { shows: showsToSend };
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

    res.json(showDetailsToSend);
  } catch (error) {
    console.log(error);
  }
});
