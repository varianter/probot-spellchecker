import { join } from "path";
const SpellChecker = require("spellchecker");
const dictionary_dir = join(__dirname, "dictionaries/no");
const custom_dict_path = join(__dirname, "dictionaries/no/nb_NO_custom.dic");
console.log("CWD: ", __dirname);
SpellChecker.setDictionary("nb_NO", dictionary_dir);
SpellChecker.addDictionary(custom_dict_path);

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
