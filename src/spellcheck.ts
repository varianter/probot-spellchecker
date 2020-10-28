const {Spellchecker, ALWAYS_USE_HUNSPELL} = require('spellchecker');

export interface Misspelled {
  text: string;
  start: number;
  end: number;
}

export default function initSpellchecker(
  language: string,
  dictionaryFolder: string,
  ignoredWords: string[],
  ignoreEmails: boolean = true
) {
  const spellchecker = new Spellchecker();
  spellchecker.setSpellcheckerType(ALWAYS_USE_HUNSPELL);
  const subfolder = sanitizeDictionaryFolder(dictionaryFolder, language);
  spellchecker.setDictionary(language, `dictionaries/${subfolder}`);
  ignoredWords = ignoredWords.map(t => t.toLowerCase());

  return function spellcheck(fullText: string): Array<Misspelled> {
    fullText = ignoreEmails ? removeEmailsFromText(fullText) : fullText;
    const result = spellchecker.checkSpelling(fullText);
    const misspellings = [];
    for (let a = 0; a < result.length; a++) {
      const {start, end} = result[a];
      const text = fullText.substring(start, end);
      if (!ignoredWords.includes(text.toLowerCase())) {
        misspellings.push({text, start, end});
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
    return language.split('_')[0];
  }

  return dictionaryFolder;
}

function removeEmailsFromText(fullText: string): string {
  const emailRegEx = new RegExp(
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
  );
  const fullTextWithoutEmail = fullText.replace(emailRegEx, '');
  return fullTextWithoutEmail;
}
