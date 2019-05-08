"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SpellChecker = require("spellchecker");
var fs = require("fs");
SpellChecker.setDictionary("nb_NO", "./dictionaries/no");
SpellChecker.addDictionary("./dictionaries/no/nb_NO_custom.dic");
function spellcheck(text) {
    var result = SpellChecker.checkSpelling(text);
    var mispellings = [];
    for (var a = 0; a < result.length; a++) {
        var _a = result[a], start = _a.start, end = _a.end;
        mispellings.push({ text: text.substring(start, end), start: start, end: end });
    }
    return mispellings;
}
exports.default = spellcheck;
//# sourceMappingURL=spellcheck.js.map