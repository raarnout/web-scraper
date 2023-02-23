const regex = /(?:^|\s)(\S+)\s+(\d+)[wx](?:,|$)/g;

function getMaxImage(srcset) {
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

export { getMaxImage };
