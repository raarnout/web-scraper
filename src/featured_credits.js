import express from "express";
import * as cheerio from "cheerio";
import { getMaxImage } from "./utils/image.js";

const PORT = 8000;
const DOMAIN = "https://www.imdb.com";
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
  const response = await fetch(`https://www.imdb.com/name/${PERSON_ID}/`);
  const html = await response.text();

  $html = cheerio.load(html);

  const person = $html(SELECTORS.NAME).text();
  const featured = featuredProjects();

  const data = {
    personId: PERSON_ID,
    person,
    featured,
  };

  console.log(JSON.stringify(data));
};

const featuredProjects = () => {
  const data = [];
  $html(SELECTORS.FEATURED.CONTAINER).each((index, element) => {
    const title = $html(SELECTORS.FEATURED.TITLE, element).text().trim();
    const link = DOMAIN + $html(SELECTORS.FEATURED.TITLE, element).attr("href");
    const profession = $html(SELECTORS.FEATURED.JOB_TITLE, element).text();
    const year = $html(SELECTORS.FEATURED.YEAR, element).text();
    const image = getMaxImage(
      $html(SELECTORS.FEATURED.IMAGE, element).attr("srcset")
    );

    data.push({
      title,
      link,
      profession,
      year,
      image,
    });
  });
  return data;
};

init();
