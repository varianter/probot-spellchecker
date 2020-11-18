import {whitelistAttributes} from './spellcheck';
const {Spellchecker, ALWAYS_USE_HUNSPELL} = require('spellchecker');

export interface Misspelled {
  text: string;
  start: number;
  end: number;
}

export interface whitelistAttributes {
  ignoreEmails?: boolean;
  ignoreUrls?: boolean;
}

export default function initSpellchecker(
  language: string,
  dictionaryFolder: string,
  ignoredWords: string[],
  whitelistAttributes?: whitelistAttributes
) {
  const spellchecker = new Spellchecker();
  spellchecker.setSpellcheckerType(ALWAYS_USE_HUNSPELL);
  const subfolder = sanitizeDictionaryFolder(dictionaryFolder, language);
  spellchecker.setDictionary(language, `dictionaries/${subfolder}`);
  ignoredWords = ignoredWords.map(t => t.toLowerCase());

  return function spellcheck(fullText: string): Array<Misspelled> {
    fullText = whitelistAttributes
      ? whitelistText(fullText, whitelistAttributes)
      : fullText;
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

function whitelistText(
  fullText: string,
  whitelistAttributes: whitelistAttributes
): string {
  const regExList: RegExp[] = [];
  whitelistAttributes.ignoreEmails && regExList.push(emailRegEx);
  whitelistAttributes.ignoreUrls &&
    regExList.push(urlDomainTopLevelDomainRegEx, urlProtocolSubDomainRegEx);

  return regExList.length > 0
    ? fullText
        .split(' ')
        .map(word => {
          regExList.map(regEx => word && word.replace(regEx, ''));
        })
        .join(' ')
    : fullText;
}

const emailRegEx = new RegExp(
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
);

// will match urls with http, https and www, e.g https://www.google.com
const urlProtocolSubDomainRegEx = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
);
//will match urls with only domain and top-level domain, e.g google.com
const urlDomainTopLevelDomainRegEx = new RegExp(
  /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
);
