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
  r: "en-US",
  page: 1,
  region: "IN",
};

const headers = {
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZWIxYzczZGY4YjE4NjZkMTk1N2FmNjUyMzViMTg0ZSIsInN1YiI6IjY0OTVkNDhiZDIzNmU2MDExZTBhMjE1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-lBefPNKUf-JMm20mfpdXZtxwnR-KvRxyYyB864-fYA",
};

// setting up show get req params and header
const showsUrl = "https://api.themoviedb.org/3/tv/on_the_air";

// listening on port
app.listen(port, () => {
  console.log("Listening on " + port);
});

app.get("/", (req, res) => {
  res.send({ hello: "hello" });
});

// getting list of currently playing movies
app.get("/currentMovies", async (req, res) => {
  try {
    const movieResponse = await Axios.get(movieUrl, { movieParams, headers });
    res.json(movieResponse.data);
  } catch (error) {
    console.log("Error:" + error.status);
  }
});

// getting list of current on air shows
app.get("");
