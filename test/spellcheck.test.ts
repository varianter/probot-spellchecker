import initSpellchecker from '../src/spellcheck';

test('nb_NO Derp', () => {
  const spellchecker = initSpellchecker('nb_NO', 'no', []);

  const misspelled = spellchecker('derp');
  expect(misspelled).toStrictEqual([{text: 'derp', start: 0, end: 4}]);
});

test('nb_NO æøå', () => {
  const spellchecker = initSpellchecker('nb_NO', 'no', []);

  const blueberryjam = spellchecker('blåbærsyltetøy');
  expect(blueberryjam).toStrictEqual([]);

  const bleubarrygem = spellchecker('blaubarstyltetaug');
  expect(bleubarrygem).toStrictEqual([
    {text: 'blaubarstyltetaug', start: 0, end: 17},
  ]);

  const words = spellchecker(
    'dette kan typisk være å gjøre gærne ting står det i håndboka'
  );
  expect(words).toStrictEqual([]);
});

test('en_US Derp', () => {
  const spellchecker = initSpellchecker('en_US', 'en', []);

  const misspelled = spellchecker('derp');
  expect(misspelled).toStrictEqual([{text: 'derp', start: 0, end: 4}]);
});

test('en_US Ignored words', () => {
  const spellchecker = initSpellchecker('en_US', 'en', ['probot']);

  const misspelled = spellchecker('A simple probot which will spellcheck.');
  expect(misspelled).toStrictEqual([]);
});

test('en_US ignored words should be case insensitive', () => {
  const spellchecker = initSpellchecker('en_US', 'en', ['probot']);

  const misspelled = spellchecker(
    'Probot is an upper case word which should be ignored by lower case ignored word'
  );
  expect(misspelled).toStrictEqual([]);
});

test('Ignore email', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreEmails: true,
  });

  const misspelled = spellchecker(
    'Following email should be removed ignored mymail@gmail.com'
  );
  expect(misspelled).toStrictEqual([]);
});

test('Ignore email in text', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreEmails: true,
  });

  const misspelled = spellchecker('ignorethismailname@variant.notextaftermail');
  expect(misspelled).toStrictEqual([]);
});

test('Not ignore email', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreEmails: false,
  });

  const misspelled = spellchecker(
    'Following email should not be ignored mymail@gmail.com'
  );
  expect(misspelled).toStrictEqual([
    {text: 'mymail', start: 38, end: 44},
    {text: 'gmail', start: 45, end: 50},
  ]);
});

test('Ignore url with https protocol', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker('Will remove link https://variant.no');
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url with http protocol', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker('Will remove link http://variant.no');
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url with https protocol and sub-domain', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker('Will remove link https://www.variant.no');
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url with https protocol, sub-domain and file path', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker(
    'Will remove link https://www.variant.no/index'
  );
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url with only domain and top-level domain', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker('Will remove link variant.no');
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url with domain, top-level domain and simple filepath', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker('Will remove link variant.no/index');
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url with sub-domain, domain, top-level domain and complex filepath', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker(
    'Will remove link www.google.com/user/userId?=6a7c227c-0157-4016-9b55-168b3ef868df/account'
  );
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url with domain, top-level domain and file path', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker('google.com/index.html');
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url with domain, top-level domain and file path in middle of text', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
  });

  const misspelled = spellchecker(
    'text before google.com/index.html and after'
  );
  expect(misspelled).toStrictEqual([]);
});

test('Ignore url and email in the same text', () => {
  const spellchecker = initSpellchecker('en_US', 'en', [], {
    ignoreUrls: true,
    ignoreEmails: true,
  });

  const misspelled = spellchecker(
    'This text have mail: mymail@gmail.com and a link www.mylink.com in the same text'
  );
  expect(misspelled).toStrictEqual([]);
});
