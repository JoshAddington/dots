// src/features/codeclimate.ts
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const cp = require("child_process");
const vscode = require("vscode");
class CodeClimateLintingProvider {
    constructor() {
        this.activeDocuments = [];
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
    }
    completeTask(fileName) {
        var index = this.activeDocuments.indexOf(fileName);
        if (index > -1) {
            this.activeDocuments.splice(index, 1);
        }
    }
    activate(subscriptions) {
        subscriptions.push(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
        vscode.workspace.onDidOpenTextDocument(this.doCClint, this, subscriptions);
        vscode.workspace.onDidCloseTextDocument((textDocument) => {
            this.diagnosticCollection.delete(textDocument.uri);
        }, null, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this.doCClint, this);
        vscode.workspace.textDocuments.forEach(this.doCClint, this);
    }
    lintCCStreamItem(item, textDocument, diagnostics) {
        try {
            let severity = item.severity.toLowerCase() === "minor" ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error;
            let message = `[codeclimate/${item.engine_name} - ${item.categories.toString()}] ${item.description}`;
            if (item.check_name === "similar-code") {
                message += '\nFiles:\n';
                item.other_locations.forEach(it => {
                    message += ` ${it.path} [${it.lines.begin}-${it.lines.end}]\n`;
                });
            }
            const loc = item.location;
            let range = null;
            if ('positions' in loc) {
                range = new vscode.Range(item.location.positions.begin.line - 1, item.location.positions.begin.column - 1, item.location.positions.begin.line - 1, 80);
            }
            else if ('lines' in loc) {
                range = new vscode.Range(item.location.lines.begin - 1, 0, item.location.lines.begin - 1, 80);
            }
            let diagnostic = new vscode.Diagnostic(range, message, severity);
            diagnostics.push(diagnostic);
        }
        catch (error) {
            console.log(error);
            this.completeTask(textDocument.fileName);
        }
    }
    runCC(cwd, exec_path) {
        let options = { cwd: cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'] };
        if (process.env.CODECLIMATE_CODE !== undefined) {
            exec_path = path.join(process.env.CODECLIMATE_CODE, exec_path);
        }
        const ls = cp.spawn('codeclimate', ['analyze', '-f', 'json', exec_path], options);
        return ls;
    }
    doCClint() {
        const conf = vscode.workspace.getConfiguration();
        if (!('linter_codeclimate' in conf && conf.linter_codeclimate.enabled) || vscode.window.activeTextEditor === null) {
            return;
        }
        const textDocument = vscode.window.activeTextEditor.document;
        if (this.activeDocuments.indexOf(textDocument.fileName) !== -1)
            return;
        this.activeDocuments.push(textDocument.fileName);
        let diagnostics = [];
        const cwd = vscode.workspace.rootPath || path.dirname(textDocument.fileName);
        const exec_path = path.relative(cwd, textDocument.fileName);
        let resultStream = '';
        try {
            const ls = this.runCC(cwd, exec_path);
            ls.stdout.on('data', (data) => {
                resultStream += data;
            });
            ls.stderr.on('data', (data) => {
                console.log(`Codeclimate Extension Execution Failed:\n${data}`);
            });
            ls.on('close', () => {
                if (resultStream !== '') {
                    JSON.parse(resultStream).forEach(item => { if ('severity' in item) {
                        this.lintCCStreamItem(item, textDocument, diagnostics);
                    } });
                    this.diagnosticCollection.set(textDocument.uri, diagnostics);
                }
                this.completeTask(textDocument.fileName);
            });
        }
        catch (error) {
            console.log(`Codeclimate Extension Execution Failed:\n${error}`);
            this.completeTask(textDocument.fileName);
        }
    }
}
exports.default = CodeClimateLintingProvider;
//# sourceMappingURL=codeclimate.js.map