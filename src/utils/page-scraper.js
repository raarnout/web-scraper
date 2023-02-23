import * as cheerio from "cheerio";

export default async function scrapePage(url) {
  const response = await fetch(url);
  const html = await response.text();
  return cheerio.load(html);
}
