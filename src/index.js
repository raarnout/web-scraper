import { writeJson } from "./utils/file-system.js";
import { downloadImage, getMaxImage } from "./utils/image.js";
import scrapePage from "./utils/page-scraper.js";
import * as dotenv from "dotenv";
dotenv.config();

const DOMAIN = "https://www.imdb.com";
const ID = process.env.PERSON;
const NODE_ENV = process.env.NODE_ENV;
const ENV = {
  DEV: "dev",
  PROD: "prod",
};

const SELECTORS = {
  USER_NAME: "#main .subpage_title_block.name-subpage-header-block a",
  PROFESSIONS: "div.head",
  DATA_CATEGORY: "data-category",
  FILM_TITLE: "> b > a",
  FILM_YEAR: ".year_column",
  POSTER: '[data-testid="hero-media__poster"] img',
  POSTER_TITLE: '[data-testid="hero-title-block__title"]',
  FILM_EPISODES: ".filmo-episodes",
  SPOTLIGHT_CONTAINER: ".ipc-list-card--span",
  SPOTLIGHT_TITLE: `.ipc-primary-image-list-card__title`,
};

let $html = undefined;
let spotlights = undefined;
let userName = "";

const init = async () => {
  spotlights = await getSpotlights();

  $html = await scrapePage(`https://www.imdb.com/name/${ID}/fullcredits`);
  userName = $html(SELECTORS.USER_NAME).text().trim();
  const professions = await getProfessions();

  const data = {
    domain: DOMAIN,
    userId: ID,
    userName,
    professions,
  };

  writeJson(userName, data, "credits");
};

const getSpotlights = async () => {
  const spotlights = [];
  const $page = await scrapePage(`https://www.imdb.com/name/${ID}/`);
  const elements = $page(SELECTORS.SPOTLIGHT_CONTAINER);

  for (const element of elements) {
    const link = $page(SELECTORS.SPOTLIGHT_TITLE, element).attr("href");
    const id = parseId(link);

    spotlights.push(id);
  }
  return spotlights;
};

const getProfessions = async () => {
  const elements = $html(SELECTORS.PROFESSIONS);

  const professions = [];
  for (const element of elements) {
    const id = element.attribs[SELECTORS.DATA_CATEGORY];
    const profession = $html(`a[name="${id}"]`).text().trim();
    const films = await getFilms(id, profession);

    professions.push({
      id,
      profession,
      films,
    });
  }

  return professions;
};

const parseId = (link) => {
  const parseId = new RegExp(/\/title\/(\w+)\//);
  return parseId.test(link) ? link.match(parseId)[1] : "";
};

const getFilms = async (id, profession) => {
  const selector = `${SELECTORS.PROFESSIONS}[${SELECTORS.DATA_CATEGORY}="${id}"]`;
  const projects = $html(selector).next().children();

  const credits = [];
  for (const project of projects) {
    const title = $html(project).find("b").find("a").text();
    const link = $html(project).find("b").find("a").attr("href");
    const id = parseId(link);
    const isSpotlight = spotlights.includes(id);
    const isSerie = $html(project).text().includes("TV Series");
    const isTvMovie = $html(project).text().includes("TV Movie");
    const isShort = $html(project).text().includes("Short");
    const isMovie = !isSerie && !isTvMovie && !isShort;
    const year = $html(project).find(".year_column").text().trim();
    const poster =
      NODE_ENV !== ENV.PROD
        ? "/url/for/film"
        : await getPosterUrl(id, `${DOMAIN}${link}`);
    const idForEpisodes = $html(project).attr("id");
    const episodes = await getEpisodes(idForEpisodes);

    credits.push({
      id,
      title,
      link,
      year,
      isSpotlight,
      isMovie,
      isSerie,
      isTvMovie,
      isShort,
      poster,
      profession,
      episodes,
    });
  }
  return credits;
};

const getEpisodes = async (filmId) => {
  const parseYear = new RegExp(/\b\d{4}\b/);
  const parseProfession = new RegExp(/\(([^()]*[a-zA-Z])\)/);

  let selector = `#${filmId} ${SELECTORS.FILM_EPISODES}`;
  const elements = $html(selector);

  const episodeData = [];

  for (const element of elements) {
    const title = $html(element).find("a").text();
    const link = $html(element).find("a").attr("href");
    const id = parseId(link);
    const isSpotlight = spotlights.includes(id);
    const innerText = $html(element).text();
    const year = parseYear.test(innerText) ? innerText.match(parseYear)[0] : "";
    const poster =
      NODE_ENV !== ENV.PROD
        ? "/url/for/episode"
        : await getPosterUrl(id, `${DOMAIN}${link}`);
    const profession = parseProfession.test(innerText)
      ? innerText.match(parseProfession)[1]
      : "";

    episodeData.push({
      id,
      title,
      link,
      year,
      isSpotlight,
      poster,
      profession,
    });
  }

  return episodeData;
};

const getPosterUrl = async (id, link) => {
  const $page = await scrapePage(link);
  const srcSet = $page(SELECTORS.POSTER).attr("srcset");
  const posterUrl = getMaxImage(srcSet);
  if (posterUrl) {
    await downloadImage(userName, posterUrl, `${id}.jpg`);
  }
  return posterUrl;
};

init();
