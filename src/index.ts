import {Application, Context} from 'probot';
import initSpellchecker from './spellcheck';
import {getDiff} from './diff';
import {extname} from 'path';
import {getConfig} from './config';
const removeMd = require('remove-markdown');

export = (app: Application) => {
  app.log('Yay, the app was loaded!');

  app.on(['pull_request.opened'], async (context: Context) => {
    const {owner, repo} = context.repo();

    const pull_request_number = context.payload.pull_request.number;
    context.log(
      `Received webhook. Pull request #${pull_request_number} opened in repository '${owner}/${repo}'.`
    );

    const config = await getConfig(context);

    const headSha = context.payload.pull_request.head.sha;
    const baseSha = context.payload.pull_request.base.sha;

    const result = await context.github.repos.compareCommits(
      context.repo({
        base: baseSha,
        head: headSha,
        headers: {
          accept: 'application/vnd.github.v3.diff',
        },
      })
    );

    context.log('Getting file diffs');
    const fileDiffs = getDiff(result.data);

    context.log(`There were ${fileDiffs.length} files with added lines`);

    const spellcheck = initSpellchecker(
      config.language,
      config.dictionary_folder,
      config.ignored_words,
      config.whitelistAttributes
    );

    const lineHits: Array<{
      path: string;
      misspelled: string[];
      position: number;
    }> = [];
    for (let fileDiff of fileDiffs) {
      context.log(`Checking file ${fileDiff.path}`);
      if (extname(fileDiff.path) === '.md') {
        for (let addedLine of fileDiff.addedLines) {
          const nonMdText = removeMd(addedLine.text);
          const misspelled = spellcheck(nonMdText).map(m => m.text);
          if (misspelled.length) {
            lineHits.push({
              path: fileDiff.path,
              position: addedLine.diffLineNumber,
              misspelled,
            });
          }
        }
      } else {
        context.log('Skipping spellcheck for non-.md file');
      }
    }

    context.log(`Found ${lineHits.length} lines total with misspellings`);

    if (lineHits && lineHits.length) {
      const review: any = context.issue({
        commit_id: headSha,
        body: config.main_comment,
        event: 'COMMENT',
        comments: lineHits.map(hit => ({
          body: `"${hit.misspelled.join('", "')}"`,
          path: hit.path,
          position: hit.position,
        })),
        pull_number: pull_request_number,
      });
      delete review.number;
      try {
        await context.github.pulls.createReview(review);
      } catch (err) {
        context.log('Creating review failed.');
        context.log(err);
      }
    }
  });
};
