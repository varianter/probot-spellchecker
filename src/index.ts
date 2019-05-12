import { Application } from "probot";
import spellcheck from "./spellcheck";
import { getDiff } from "./diff";
import path from "path";
const removeMd = require("remove-markdown");
export = (app: Application) => {
  app.log("Yay, the app was loaded!");

  app.on(["pull_request.opened"], async context => {
    context.log("Pull request opened, receieved hook");
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
    for (let hit of lineHits) {
      await context.github.pulls.createComment(
        context.issue({
          body: `Mulig skrivefeil: ${hit.misspelled.join(", ")}`,
          path: hit.path,
          position: hit.position,
          commit_id: headSha
        })
      );
    }
  });
};
