const SpellChecker = require("spellchecker");
const fs = require("fs");
SpellChecker.setDictionary("nb_NO", "./dictionaries/no");
SpellChecker.addDictionary("./dictionaries/no/nb_NO_custom.dic");

export interface Mispelled {
  text: string;
  start: number;
  end: number;
}
export default function spellcheck(text: string): Array<Mispelled> {
  const result = SpellChecker.checkSpelling(text);
  const mispellings = [];
  for (let a = 0; a < result.length; a++) {
    const { start, end } = result[a];
    mispellings.push({ text: text.substring(start, end), start, end });
  }
  return mispellings;
}
