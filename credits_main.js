require("dotenv").config();
const cheerio = require("cheerio");
const express = require("express");

const PORT = 8000;
const DOMAIN = "https://www.imdb.com";
const URL = `${DOMAIN}/name/${process.env.IMDB_PERSON_ID}`;

const LIST_CARD = ".ipc-primary-image-list-card__";

const SELECTORS = {
  NAME: "h1 span",
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
  const response = await fetch(
    `https://www.imdb.com/name/${process.env.IMDB_PERSON_ID}/`
  );
  const html = await response.text();

  $html = cheerio.load(html);

  const name = $html(SELECTORS.NAME).text();
  const featured = featuredProjects();

  const data = {
    name,
    featured,
  };

  console.log(data);
};

const featuredProjects = () => {
  const data = [];
  $html(SELECTORS.FEATURED.CONTAINER).each((index, element) => {
    const title = $html(SELECTORS.FEATURED.TITLE, element).text().trim();
    const link = DOMAIN + $html(SELECTORS.FEATURED.TITLE, element).attr("href");
    const jobTitle = $html(SELECTORS.FEATURED.JOB_TITLE, element).text();
    const year = $html(SELECTORS.FEATURED.YEAR, element).text();
    const image = getMaxImageUrl(
      $html(SELECTORS.FEATURED.IMAGE, element).attr("srcset")
    );

    data.push({
      title,
      link,
      jobTitle,
      year,
      image,
    });
  });
  return data;
};

const getMaxImageUrl = (srcset) => {
  let regex = /(?:^|\s)(\S+)\s+(\d+)[wx](?:,|$)/g;
  let match;
  let maxImage;
  let maxWidth = 0;

  while ((match = regex.exec(srcset)) !== null) {
    let url = match[1];
    let width = parseInt(match[2]);

    if (width > maxWidth) {
      maxWidth = width;
      maxImage = url;
    }
  }

  return maxImage;
};

init();
