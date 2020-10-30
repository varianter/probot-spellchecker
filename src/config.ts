import { Context } from 'probot';

const getConfigFromContext = require('probot-config');

interface Config {
  // The language to spellcheck
  language: string;
  // The folder the dictionary is located in
  dictionary_folder: string;
  // These words should not be marked as misspellings
  ignored_words: string[];
  // The main comment
  main_comment: string;
  // Skipping spellcheck if added lines are fewer than the threshold
  lines_changed_threshold: number;
}

export const getConfig = async (context: Context): Promise<Config> => {
  const config: Config = await getConfigFromContext(
    context,
    'spellchecker.yml',
  );

  if (!config) {
    const { owner, repo } = context.repo();
    context.log(`No spellchecker.yml found in repository '${owner}/${repo}'.`);

    return defaultConfig;
  }

  if (!config.language) {
    context.log(
      `Language was not set in spellchecker.yml, defaulting to ${defaultConfig.language}`,
    );
  }

  return {
    ...defaultConfig,
    ...config,
  };
};

const defaultConfig: Config = {
  language: 'en_US',
  dictionary_folder: 'en',
  main_comment: 'I found one or more possible misspellings 😇',
  ignored_words: [],
  lines_changed_threshold: -1,
};
