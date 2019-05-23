export interface Mispelled {
  text: string;
  start: number;
  end: number;
}

export default function initSpellchecker(
  language: string,
  dictionaryFolder: string,
  ignoredWords: string[]
) {
  const SpellChecker = require("spellchecker");
  const subfolder = sanitizeDictionaryFolder(dictionaryFolder, language);
  SpellChecker.setDictionary(language, `dictionaries/${subfolder}`);

  return function spellcheck(fullText: string): Array<Mispelled> {
    const result = SpellChecker.checkSpelling(fullText);
    const mispellings = [];
    for (let a = 0; a < result.length; a++) {
      const { start, end } = result[a];
      const text = fullText.substring(start, end);
      if (!ignoredWords.includes(text)) {
        mispellings.push({ text, start, end });
      }
    }
    return mispellings;
  };
}

function sanitizeDictionaryFolder(
  dictionaryFolder: string,
  language: string
): string {
  if (!dictionaryFolder || dictionaryFolder.length == 0) {
    // Attempt to split and use first part of language
    return language.split("_")[0];
  }

  return dictionaryFolder;
}
