"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
function getDiff(diff) {
    var files = [];
    var diffFileMatch = diff.split(/^diff --git a\/(.+?) b\/(.+?)$/gm);
    for (var i = 1; i < diffFileMatch.length; i += 3) {
        var path = diffFileMatch[i + 1]; // taking the b-path in case of rename from a-path
        var actualDiff = diffFileMatch[i + 2];
        var diffLines = actualDiff.split(os.EOL);
        var diffLineNumber = 0;
        var firstAtAtHunkPassed = false;
        var addedLines = [];
        for (var _i = 0, diffLines_1 = diffLines; _i < diffLines_1.length; _i++) {
            var line = diffLines_1[_i];
            if (firstAtAtHunkPassed) {
                diffLineNumber++;
                if (line.match(/^\+(?!\+\+ [a|b]\/)(.+)/)) {
                    addedLines.push({ text: line.slice(1), diffLineNumber: diffLineNumber });
                }
            }
            else if (line.match(/^@@ -(\d+,\d+) \+(\d+,\d+) @@/)) {
                firstAtAtHunkPassed = true;
            }
        }
        if (!addedLines.length) {
            continue;
        }
        var fileDiff = { path: path, addedLines: addedLines };
        files.push(fileDiff);
    }
    return files;
}
exports.getDiff = getDiff;
//# sourceMappingURL=diff.js.map