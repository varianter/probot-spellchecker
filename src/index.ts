import { Application } from "probot";
import spellcheck from "./spellcheck";
import { getDiff } from "./diff";
import path from "path";
const removeMd = require("remove-markdown");
export = (app: Application) => {
  app.log("Yay, the app was loaded!");

  app.on(["pull_request.opened"], async context => {
    const pull_request_number = context.payload.pull_request.number;
    context.log(`Pull request #${pull_request_number} opened, receieved hook`);
    const headSha = context.payload.pull_request.head.sha;
    const baseSha = context.payload.pull_request.base.sha;

    const result = await context.github.repos.compareCommits(
      context.repo({
        base: baseSha,
        head: headSha,
        headers: {
          accept: "application/vnd.github.v3.diff"
        }
      })
    );

    context.log("Getting file diffs");
    const fileDiffs = getDiff(result.data);

    context.log(`There were ${fileDiffs.length} files with added lines`);

    const lineHits: Array<{
      path: string;
      misspelled: string[];
      position: number;
    }> = [];
    for (let fileDiff of fileDiffs) {
      context.log(`Checking file ${fileDiff.path}`);
      if (path.extname(fileDiff.path) === ".md") {
        for (let addedLine of fileDiff.addedLines) {
          const nonMdText = removeMd(addedLine.text);
          const misspelled = spellcheck(nonMdText).map(m => m.text);
          context.log(`Found ${misspelled.length} misspellings in line`);
          if (misspelled.length) {
            lineHits.push({
              path: fileDiff.path,
              position: addedLine.diffLineNumber,
              misspelled
            });
          }
        }
      } else {
        context.log("Skipping spellcheck for non-.md file");
      }
    }

    context.log(`Found ${lineHits.length} lines total with misspellings`);
    if (lineHits && lineHits.length) {
      const review: any = context.issue({
        commit_id: headSha,
        body: "Jeg fant en eller flere mulige skrivefeil 😇",
        event: "COMMENT",
        comments: lineHits.map(hit => ({
          body: `"${hit.misspelled.join('", "')}"`,
          path: hit.path,
          position: hit.position
        })),
        pull_number: pull_request_number
      });
      delete review.number;
      try {
        await context.github.pulls.createReview(review);
      } catch (err) {
        context.log("Creating review failed.");
        context.log(err);
      }
    }
  });
};
