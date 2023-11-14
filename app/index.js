import express from "express";
import bodyParser from "body-parser";

// initialising and configuring app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

export default app;
