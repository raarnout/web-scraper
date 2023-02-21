require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const PORT = 8000;
const URL = `https://www.imdb.com/name/${process.env.IMDB_PERSON_ID}/fullcredits`;

const app = express();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

axios(URL).then((response) => {
  const html = response.data;
  const $ = cheerio.load(html);
  const jobTitlesFilm = getJobTitlesFilm($);
});

const getJobTitlesFilm = ($) => {
  const jobTitles = [];
  $("div.head").each((index, element) => {
    const id = element.attribs["id"];
    jobTitles.push(id.substring(11));
  });
  console.log(jobTitles);
};
