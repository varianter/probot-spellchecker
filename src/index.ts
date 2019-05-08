import { Application } from "probot";
import spellcheck from "./spellcheck";
import { getDiff } from "./diff";
import path from "path";
const removeMd = require("remove-markdown");
export = (app: Application) => {
  app.log("Yay, the app was loaded!");

  app.on(["pull_request.opened"], async context => {
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

    const fileDiffs = getDiff(result.data);

    const lineHits: Array<{
      path: string;
      misspelled: string[];
      position: number;
    }> = [];
    for (let fileDiff of fileDiffs) {
      if (path.extname(fileDiff.path) === ".md") {
        for (let addedLine of fileDiff.addedLines) {
          const nonMdText = removeMd(addedLine.text);
          const misspelled = spellcheck(nonMdText).map(m => m.text);
          if (misspelled.length) {
            lineHits.push({
              path: fileDiff.path,
              position: addedLine.diffLineNumber,
              misspelled
            });
          }
        }
      }
    }

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
