const { Spellchecker, ALWAYS_USE_HUNSPELL } = require("spellchecker");

export interface Misspelled {
  text: string;
  start: number;
  end: number;
}

export default function initSpellchecker(
  language: string,
  dictionaryFolder: string,
  ignoredWords: string[]
) {
  const spellchecker = new Spellchecker();
  spellchecker.setSpellcheckerType(ALWAYS_USE_HUNSPELL);
  const subfolder = sanitizeDictionaryFolder(dictionaryFolder, language);
  spellchecker.setDictionary(language, `dictionaries/${subfolder}`);
  ignoredWords = ignoredWords.map((t) => t.toLowerCase());

  return function spellcheck(fullText: string): Array<Misspelled> {
    const result = spellchecker.checkSpelling(fullText);
    const misspellings = [];
    for (let a = 0; a < result.length; a++) {
      const { start, end } = result[a];
      const text = fullText.substring(start, end);
      if (!ignoredWords.includes(text.toLowerCase())) {
        misspellings.push({ text, start, end });
      }
    }
    return misspellings;
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
