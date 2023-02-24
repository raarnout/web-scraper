# IMDB portfolio scraper

IMDB portfolio scraper is a NodeJS application that scrapes a persons credits from the IMDB site, including poster images. The credits will be saved in a credits.json file and can be used as static data for portfolio websites.

## Current Project Status
This project aims to collect static data. The codebase is therefore set up quickly (not properly).

## How does it work?
The `.env` file contains a `'PERSON'` variable which contains the id of a IMDB profile. E.g. if you want to scrape all credits for 'Acda en de Munnik', go to imdb.com and search for 'Acda en de Munnik'. In the url you will find the id, starting with 'nm'. (In case of `'Acda en de Munnik'` it is `nm4268739`). Copy paste the id in the `'PERSON'` variable in the `.env` file and make sure `NODE_ENV` is set to "prod". If the `NODE_ENV` is not set to "prod", the tool won't scrape images. Run `npm install` and `npm run start`. The tool start scraping the IMDB profile and will store the `credits.json` in the `dist` folder as `Acda en de Munnik/credits.json`. As well the poster-images will be saved in the same folder.

## Notes!
Poster-images are saved with the id of the movie they belong to. e.g. `tt0391581.jpg`. In the `credits.json` you will find the origional url for each image, in this case `https://m.media-amazon.com/images/M/MV5BNWVjMGIwMDMtOWVmNC00MzJkLTlmYzMtM2QzM2Q4MjI0NTg0XkEyXkFqcGdeQXVyMjIxMzkyMDg@._V1_QL75_UX380_CR0,2,380,562_.jpg`


