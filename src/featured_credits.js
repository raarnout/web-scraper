import express from "express";
import scrapePage from "./utils/page-scraper.js";
import * as dotenv from "dotenv";

import { getMaxImage } from "./utils/image.js";
import { writeJson } from "./utils/file-system.js";

const PORT = 8000;
const DOMAIN = "https://www.imdb.com";
dotenv.config();
const PERSON_ID = process.env.PERSON;
const URL = `${DOMAIN}/name/${PERSON_ID}/fullcredits`;

const LIST_CARD = ".ipc-primary-image-list-card__";

const SELECTORS = {
  NAME: '[data-testid="hero__pageTitle"] span',
  FEATURED: {
    CONTAINER: ".ipc-list-card--span",
    TITLE: `${LIST_CARD}title`,
    JOB_TITLE: `${LIST_CARD}content-mid-bottom ${LIST_CARD}secondary-text`,
    YEAR: `${LIST_CARD}content-bottom ${LIST_CARD}secondary-text`,
    IMAGE: `.ipc-poster__poster-image img`,
  },
};

const app = express();
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

let $html;

const init = async () => {
  $html = await scrapePage(`https://www.imdb.com/name/${PERSON_ID}/`);

  const person = $html(SELECTORS.NAME).text();
  const featured = await featuredProjects();

  const data = {
    personId: PERSON_ID,
    person,
    featured,
  };

  writeJson(data, "featured_credits");
};

const featuredProjects = async () => {
  const data = [];
  const elements = $html(SELECTORS.FEATURED.CONTAINER);

  for (const element of elements) {
    const title = $html(SELECTORS.FEATURED.TITLE, element).text().trim();
    const link = DOMAIN + $html(SELECTORS.FEATURED.TITLE, element).attr("href");
    const poster = await getPosterUrl(link);
    const profession = $html(SELECTORS.FEATURED.JOB_TITLE, element).text();
    const year = $html(SELECTORS.FEATURED.YEAR, element).text();
    const image = getMaxImage(
      $html(SELECTORS.FEATURED.IMAGE, element).attr("srcset")
    );

    data.push({
      title,
      link,
      poster,
      profession,
      year,
      image,
    });
  }
  return data;
};

const getPosterUrl = async (link) => {
  $html = await scrapePage(link);
  const srcSet = $html('[data-testid="hero-media__poster"] img').attr("srcset");
  const posterUrl = getMaxImage(srcSet);
  return posterUrl;
};

init();
