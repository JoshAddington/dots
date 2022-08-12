"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codeclimate_1 = require("./codeclimate");
function activate(context) {
    let linter = new codeclimate_1.default();
    linter.activate(context.subscriptions);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map