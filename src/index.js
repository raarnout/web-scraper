import { writeJson } from "./utils/file-system.js";
import { getMaxImage } from "./utils/image.js";
import scrapePage from "./utils/page-scraper.js";
import * as dotenv from "dotenv";
dotenv.config();

const ID = process.env.PERSON;
const ENV = process.env.NODE_ENV;
const DOMAIN = "https://www.imdb.com";
const SELECTORS = {
  USER_NAME: "#main .subpage_title_block.name-subpage-header-block a",
  PROFESSIONS: "div.head",
  DATA_CATEGORY: "data-category",
  FILM_TITLE: "> b > a",
  FILM_YEAR: ".year_column",
  POSTER: '[data-testid="hero-media__poster"] img',
  FILM_EPISODES: ".filmo-episodes",
};

let $html = undefined;

const init = async () => {
  $html = await scrapePage(`https://www.imdb.com/name/${ID}/fullcredits`);
  const professions = await getProfessions();

  const data = {
    domain: DOMAIN,
    userId: ID,
    userName: $html(SELECTORS.USER_NAME).text().trim(),
    professions,
  };

  writeJson(data, "full_credits");
};

const getProfessions = async () => {
  const professions = [];
  const elements = $html(SELECTORS.PROFESSIONS);
  for (const element of elements) {
    const id = element.attribs[SELECTORS.DATA_CATEGORY];
    const profession = $html(`a[name="${id}"]`).text().trim();
    const credits = await getFilms(id);

    professions.push({
      id,
      profession,
      credits,
    });
  }

  return professions;
};

const getFilms = async (id) => {
  const selector = `${SELECTORS.PROFESSIONS}[${SELECTORS.DATA_CATEGORY}="${id}"]`;
  const projects = $html(selector).next().children();
  const parseId = new RegExp(/\/title\/(\w+)\//);

  const mediaCredits = [];
  for (const project of projects) {
    const title = $html(project).find("b").find("a").text();
    const link = $html(project).find("b").find("a").attr("href");
    const id = parseId.test(link) ? link.match(parseId)[1] : "";
    const year = $html(project).find(".year_column").text().trim();
    const poster = await getPosterUrl(`${DOMAIN}${link}`, "film");
    const idForEpisodes = $html(project).attr("id");
    const episodes = await getEpisodes(idForEpisodes);

    mediaCredits.push({
      id,
      title,
      link,
      year,
      poster,
      episodes,
    });
  }
  return mediaCredits;
};

const getEpisodes = async (filmId) => {
  const startLog = filmId === "assistant_director-tt8180660";

  const parseId = new RegExp(/\/title\/(\w+)\//);
  const parseYear = new RegExp(/\b\d{4}\b/);
  const parseProfession = new RegExp(/\(([^()]*[a-zA-Z])\)/);

  const selector = `#${filmId} ${SELECTORS.FILM_EPISODES}`;
  const elements = $html(selector);

  if (startLog) {
    console.log(elements);
  }

  const episodeData = [];

  for (const element of elements) {
    const title = $html(element).find("a").text();
    const link = $html(element).find("a").attr("href");
    const id = parseId.test(link) ? link.match(parseId)[1] : "";
    const innerText = $html(element).text();
    const year = parseYear.test(innerText) ? innerText.match(parseYear)[0] : "";
    const poster = await getPosterUrl(`${DOMAIN}${link}`, "episode");
    const profession = parseProfession.test(innerText)
      ? innerText.match(parseProfession)[1]
      : "";

    episodeData.push({
      id,
      title,
      link,
      year,
      poster,
      profession,
    });
  }

  return episodeData;
};

const getPosterUrl = async (link, source) => {
  console.log(`${source} ${link}`);
  $html = await scrapePage(link);
  const srcSet = $html(SELECTORS.POSTER).attr("srcset");
  const posterUrl = getMaxImage(srcSet);
  return posterUrl;
};

init();
