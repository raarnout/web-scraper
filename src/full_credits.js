import express from "express";
import scrapePage from "./utils/page-scraper.js";
import * as cheerio from "cheerio";
import * as dotenv from "dotenv";
import { writeJson } from "./utils/file-system.js";

const PORT = 8000;
const DOMAIN = "https://www.imdb.com";
dotenv.config();
const PERSON_ID = process.env.PERSON;
const URL = `${DOMAIN}/name/${PERSON_ID}/fullcredits`;

const SELECTORS = {
  PERSON: "#main .subpage_title_block.name-subpage-header-block a",
  HEAD_CATEGORIES: "div.head",
  ATTR_DATA_CATEGORY: "data-category",
  FILM_NAME: "> b > a",
  FILM_YEAR: ".year_column",
  FILM_EPISODES: ".filmo-episodes",
};

const app = express();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

let $html;
const init = async () => {
  $html = await scrapePage(
    `https://www.imdb.com/name/${PERSON_ID}/fullcredits`
  );

  const data = {
    domain: DOMAIN,
    personId: PERSON_ID,
    person: $html(SELECTORS.PERSON).text(),
    professions: getProfessions(),
  };

  writeJson(data, "fullcredits");
};

const getProfessions = () => {
  const categories = [];
  $html(SELECTORS.HEAD_CATEGORIES).each((index, element) => {
    const professionId = element.attribs[SELECTORS.ATTR_DATA_CATEGORY];
    const professionTitle = $html(`a[name="${professionId}"]`).text().trim();
    const projects = getprojects(professionId);

    categories.push({
      professionId,
      professionTitle,
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
    const link = $html(`${id} ${SELECTORS.FILM_NAME}`).attr("href");
    const year = $html(`${id} ${SELECTORS.FILM_YEAR}`).text().trim();
    const episodes = getEpisodes(id);
    filmData.push({ id, title, year, link, episodes });
  });
  return filmData;
};

const getEpisodes = (projectId) => {
  const selector = `${projectId} ${SELECTORS.FILM_EPISODES}`;
  const $episodeContent = $html(selector);
  const parseYear = new RegExp(/\b\d{4}\b/);
  const parseProfession = new RegExp(/\(([^()]*[a-zA-Z])\)/);

  const episodeData = [];

  $episodeContent.each((index, element) => {
    const title = $html("a", element).text();

    const innerText = $html(element).text();
    const year = parseYear.test(innerText) ? innerText.match(parseYear)[0] : "";
    const profession = parseProfession.test(innerText)
      ? innerText.match(parseProfession)[1]
      : "";

    const link = `${$html("a", element).attr("href")}`;

    episodeData.push({
      title,
      link,
      year,
      profession,
    });
  });

  return episodeData;
};

init();
