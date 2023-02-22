require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const PORT = 8000;
const DOMAIN = "https://www.imdb.com";
const URL = `${DOMAIN}/name/${process.env.IMDB_PERSON_ID}/fullcredits`;

const SELECTORS = {
  NAME: "#main .subpage_title_block.name-subpage-header-block a",
  HEAD_CATEGORIES: "div.head",
  ATTR_DATA_CATEGORY: "data-category",
  FILM_NAME: "> b > a",
  FILM_YEAR: ".year_column",
  FILM_EPISODES: ".filmo-episodes",
};

const app = express();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

let $html;

axios(URL).then((response) => {
  const html = response.data;
  $html = cheerio.load(html);

  const data = {
    name: $html(SELECTORS.NAME).text(),
    jobs: getJobs(),
  };

  console.log(JSON.stringify(data));
});

const getJobs = () => {
  const categories = [];
  $html(SELECTORS.HEAD_CATEGORIES).each((index, element) => {
    const jobId = element.attribs[SELECTORS.ATTR_DATA_CATEGORY];
    const functionTitle = $html(`a[name="${jobId}"]`).text().trim();
    const projects = getprojects(jobId);

    categories.push({
      jobId,
      functionTitle,
      projects,
    });
  });
  return categories;
};

const getprojects = (categoryId) => {
  const selector = `${SELECTORS.HEAD_CATEGORIES}[${SELECTORS.ATTR_DATA_CATEGORY}="${categoryId}"]`;
  const $categoryContent = $html(selector).next().children();

  const filmData = [];

  $categoryContent.each((index, element) => {
    const id = `#${element.attribs["id"]}`;
    const title = $html(`${id} ${SELECTORS.FILM_NAME}`).text();
    const link = DOMAIN + $html(`${id} ${SELECTORS.FILM_NAME}`).attr("href");
    const year = $html(`${id} ${SELECTORS.FILM_YEAR}`).text().trim();
    const Episodes = getEpisodes(id);
    filmData.push({ id, title, year, link, Episodes });
  });
  return filmData;
};

const getEpisodes = (projectId) => {
  const selector = `${projectId} ${SELECTORS.FILM_EPISODES}`;
  const $episodeContent = $html(selector);
  const parseYear = new RegExp(/\b\d{4}\b/);
  const parseRole = new RegExp(/\(([^()]*[a-zA-Z])\)/);

  const episodeData = [];

  $episodeContent.each((index, element) => {
    const title = $html("a", element).text();

    const innerText = $html(element).text();
    const year = parseYear.test(innerText) ? innerText.match(parseYear)[0] : "";
    const role = parseRole.test(innerText) ? innerText.match(parseRole)[1] : "";

    const link = `${DOMAIN}${$html("a", element).attr("href")}`;

    episodeData.push({
      title,
      year,
      role,
      link,
    });
  });

  return episodeData;
};
