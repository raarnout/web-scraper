require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const PORT = 8000;
const URL = `https://www.imdb.com/name/${process.env.IMDB_PERSON_ID}/fullcredits`;

const app = express();
console.clear();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

let $html;

axios(URL).then((response) => {
  const html = response.data;
  $html = cheerio.load(html, { ignoreWhitespace: true });
  const jobCategories = getJobCategories();
  const jobData = getJobData(jobCategories);
  console.log(JSON.stringify(jobData));
});

const getJobCategories = () => {
  const categories = [];
  $html("div.head").each((index, element) => {
    categories.push(element.attribs["data-category"]);
  });
  return categories;
};

const getJobData = (jobCategories) => {
  return jobCategories.map((id) => {
    const mainSelector = `div.head[data-category='${id}']`;
    const categoryTitle = $html(`${mainSelector} a`).text();
    const categoryContent = getCategoryContent(mainSelector);
    return {
      id,
      categoryTitle,
      categoryContent,
    };
  });
};

const getCategoryContent = (mainSelector) => {
  const items = [];
  $html(`${mainSelector} + div .filmo-row`).each((index, element) => {
    const id = element.attribs["id"];
    const filmTitle = $html(`#${id} b a`).html();
    const isSeries = $html(`#${id}`).text().includes("TV Series");
    const isTvMiniSerie = $html(`#${id}`).text().includes("TV Mini Series");
    const isTvMovie = $html(`#${id}`).text().includes("TV Movie");
    const isShort = $html(`#${id}`).text().includes("Short");
    const year = $html(`#${id} .year_column`).text().replace(/\n/g, "").trim();

    items.push({
      id,
      filmTitle,
      isSeries,
      isTvMiniSerie,
      isTvMovie,
      isShort,
      year,
    });
  });
  return items;
};
