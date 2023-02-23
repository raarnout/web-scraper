import * as fs from "fs";

const writeJson = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  fs.writeFile(`./dist/${filename}.json`, json, "utf8", (error) => {
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
