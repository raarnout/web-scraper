import * as fs from "fs";

const writeJson = (username, data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const savePath = `./dist/${username}/`;
  // Make sure the save directory exists
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  fs.writeFile(`${savePath}${filename}.json`, json, "utf8", (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log(
        `${filename}.json has been saved successfully in the 'dist' folder`
      );
    }
  });
};

export { writeJson };
