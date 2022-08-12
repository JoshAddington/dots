"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const htmlbeautifier_1 = require("./htmlbeautifier");
class HtmlBeautifierProvider {
    constructor() {
        this.htmlbeautifier = new htmlbeautifier_1.default();
    }
    provideDocumentFormattingEdits(document, options, token) {
        return this.htmlbeautifier.format(document.getText()).then((result) => {
            return [
                new vscode.TextEdit(document.validateRange(new vscode.Range(0, 0, Infinity, Infinity)), result),
            ];
        }, (err) => {
            // will be handled in format
            return [];
        });
    }
}
exports.default = HtmlBeautifierProvider;
//# sourceMappingURL=htmlbeautifierProvider.js.map