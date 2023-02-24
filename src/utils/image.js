import https from "https";
import fs from "fs";

function getMaxImage(srcset) {
  const regex = /(?:^|\s)(\S+)\s+(\d+)[wx](?:,|$)/g;
  let match;
  let maxImage;
  let maxWidth = 0;

  while ((match = regex.exec(srcset)) !== null) {
    const url = match[1];
    const width = parseInt(match[2]);

    if (width > maxWidth) {
      maxWidth = width;
      maxImage = url;
    }
  }

  return maxImage;
}

const downloadImage = async (userName, imageUrl, fileName) => {
  const savePath = `./dist/${userName}/`;
  // Make sure the save directory exists
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  // Create a write stream to save the file
  const file = fs.createWriteStream(savePath + fileName);

  // Send a request to the image URL
  https
    .get(imageUrl, (response) => {
      // Pipe the response into the write stream
      response.pipe(file);

      // Log a message when the download is complete
      file.on("finish", () => {
        console.log(`Download complete: ${fileName}`);
        file.close();
      });
    })
    .on("error", (error) => {
      // Log an error message if the download fails
      console.error(`Error downloading ${fileName}: ${error}`);

      // Delete the file if it was partially downloaded
      fs.unlink(savePath + fileName, () => {});
    });
};

export { getMaxImage, downloadImage };
