export const TOTAL_STICKERS = 250;

export const SECTIONS = [
  {
    id: 1,
    title: "Sekcija 1",
    from: 1,
    to: 80,
  },
  {
    id: 2,
    title: "Sekcija 2",
    from: 81,
    to: 160,
  },
  {
    id: 3,
    title: "Sekcija 3",
    from: 161,
    to: 250,
  },
];

/*
  Returns:

  [1, 2, 3, ... 250]
*/
export function allStickerNumbers() {
  return Array.from(
    {
      length: TOTAL_STICKERS,
    },
    (_, index) => index + 1,
  );
}

/*
  Determine which section a
  sticker belongs to.
*/
export function sectionForSticker(number) {
  if (number <= 80) {
    return 1;
  }

  if (number <= 160) {
    return 2;
  }

  return 3;
}

/*
  Calculate missing stickers
  automatically from owned stickers.
*/
export function getMissingStickers(ownedStickers) {
  const ownedSet = new Set(ownedStickers || []);

  return allStickerNumbers().filter((number) => !ownedSet.has(number));
}

/*
  Returns only sticker numbers
  that have at least one duplicate.

  Example:

  {
    5: 2,
    12: 1,
    30: 3
  }

  becomes:

  [5, 12, 30]
*/
export function getDuplicateStickerNumbers(duplicates) {
  return Object.entries(duplicates || {})
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([number]) => Number(number))
    .sort((a, b) => a - b);
}

/*
  Convert sticker numbers to a
  compact hexadecimal bitset.

  Instead of storing:

  [1, 2, 5, 18, 60...]

  in the QR code, we convert all
  250 sticker states into bits.

  This makes the QR much smaller.
*/
export function numbersToHexBitset(numbers) {
  const stickerSet = new Set(numbers || []);

  let bits = "";

  for (let number = 1; number <= TOTAL_STICKERS; number++) {
    bits += stickerSet.has(number) ? "1" : "0";
  }

  /*
    Hexadecimal requires groups
    of four bits.
  */
  while (bits.length % 4 !== 0) {
    bits += "0";
  }

  let hex = "";

  for (let index = 0; index < bits.length; index += 4) {
    const group = bits.slice(index, index + 4);

    hex += parseInt(group, 2).toString(16);
  }

  return hex;
}

/*
  Reverse the QR bitset back
  into sticker numbers.
*/
export function hexBitsetToNumbers(hex) {
  let bits = "";

  for (const character of String(hex || "")) {
    bits += parseInt(character, 16).toString(2).padStart(4, "0");
  }

  const numbers = [];

  for (let index = 0; index < Math.min(bits.length, TOTAL_STICKERS); index++) {
    if (bits[index] === "1") {
      numbers.push(index + 1);
    }
  }

  return numbers;
}

/*
  Create the data that will
  be stored inside the QR.
*/
export function createSharePayload(album) {
  if (!album) {
    return "";
  }

  const missing = getMissingStickers(album.ownedStickers || []);

  const duplicateNumbers = getDuplicateStickerNumbers(album.duplicates || {});

  return JSON.stringify({
    /*
      Used so our scanner knows
      this QR belongs to our app.
    */
    app: "zivotinjsko-carstvo",

    /*
      QR data format version.
    */
    version: 1,

    /*
      Shared album name.
    */
    album: album.name,

    /*
      Missing stickers.
    */
    missing: numbersToHexBitset(missing),

    /*
      Duplicate sticker numbers.
    */
    duplicates: numbersToHexBitset(duplicateNumbers),
  });
}

/*
  Read a QR created by our app.
*/
export function parseSharePayload(rawValue) {
  const data = JSON.parse(rawValue);

  if (data?.app !== "zivotinjsko-carstvo") {
    throw new Error(
      "Ovaj QR kod nije izrađen u aplikaciji Skupljanje Sličica.",
    );
  }

  if (data?.version !== 1) {
    throw new Error("Nepodržana verzija QR koda.");
  }

  return {
    albumName: data.album || "Podijeljeni album",

    missing: hexBitsetToNumbers(data.missing),

    duplicates: hexBitsetToNumbers(data.duplicates),
  };
}

/*
  Useful later for trade
  comparison.
*/
export function groupBySection(numbers) {
  const result = {
    1: [],
    2: [],
    3: [],
  };

  for (const number of numbers || []) {
    const section = sectionForSticker(number);

    result[section].push(number);
  }

  return result;
}
