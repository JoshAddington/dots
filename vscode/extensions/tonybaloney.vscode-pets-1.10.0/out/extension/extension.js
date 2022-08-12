"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawnPetDeactivate = exports.petPlaygroundDeactivate = exports.activate = exports.storeCollectionAsMemento = exports.PetSpecification = void 0;
const path = require("path");
const vscode = require("vscode");
const EXTRA_PETS_KEY = 'vscode-pets.extra-pets';
const EXTRA_PETS_KEY_TYPES = EXTRA_PETS_KEY + '.types';
const EXTRA_PETS_KEY_COLORS = EXTRA_PETS_KEY + '.colors';
const DEFAULT_PET_SCALE = "nano" /* nano */;
const DEFAULT_COLOR = "brown" /* brown */;
const DEFAULT_PET_TYPE = "cat" /* cat */;
const DEFAULT_POSITION = "panel" /* panel */;
const DEFAULT_THEME = "none" /* none */;
const ALL_PETS = [
    "cat" /* cat */,
    "clippy" /* clippy */,
    "crab" /* crab */,
    "dog" /* dog */,
    "rocky" /* rocky */,
    "rubber-duck" /* rubberduck */,
    "snake" /* snake */,
    "totoro" /* totoro */,
    "zappy" /* zappy */,
];
const ALL_COLORS = [
    "black" /* black */,
    "brown" /* brown */,
    "green" /* green */,
    "yellow" /* yellow */,
    "gray" /* gray */,
    "red" /* red */,
    "null" /* null */,
];
const ALL_SCALES = ["nano" /* nano */, "medium" /* medium */, "large" /* large */];
const ALL_THEMES = ["none" /* none */, "forest" /* forest */, "castle" /* castle */];
let webviewViewProvider;
function getConfiguredSize() {
    var size = vscode.workspace
        .getConfiguration('vscode-pets')
        .get('petSize', DEFAULT_PET_SCALE);
    if (ALL_SCALES.lastIndexOf(size) === -1) {
        size = DEFAULT_PET_SCALE;
    }
    return size;
}
function getConfiguredTheme() {
    var theme = vscode.workspace
        .getConfiguration('vscode-pets')
        .get('theme', DEFAULT_THEME);
    if (ALL_THEMES.lastIndexOf(theme) === -1) {
        theme = DEFAULT_THEME;
    }
    return theme;
}
function getConfiguredThemeKind() {
    return vscode.window.activeColorTheme.kind;
}
function getConfigurationPosition() {
    return vscode.workspace
        .getConfiguration('vscode-pets')
        .get('position', DEFAULT_POSITION);
}
function updateExtensionPositionContext() {
    vscode.commands.executeCommand('setContext', 'vscode-pets.position', getConfigurationPosition());
}
class PetSpecification {
    constructor(color, type, size) {
        this.color = color;
        this.type = type;
        this.size = size;
    }
    static fromConfiguration() {
        var color = vscode.workspace
            .getConfiguration('vscode-pets')
            .get('petColor', DEFAULT_COLOR);
        if (ALL_COLORS.lastIndexOf(color) === -1) {
            color = DEFAULT_COLOR;
        }
        var type = vscode.workspace
            .getConfiguration('vscode-pets')
            .get('petType', DEFAULT_PET_TYPE);
        if (ALL_PETS.lastIndexOf(type) === -1) {
            type = DEFAULT_PET_TYPE;
        }
        return new PetSpecification(color, type, getConfiguredSize());
    }
    static collectionFromMemento(context, size) {
        var contextTypes = context.globalState.get(EXTRA_PETS_KEY_TYPES, []);
        var contextColors = context.globalState.get(EXTRA_PETS_KEY_COLORS, []);
        var result = new Array();
        for (let index = 0; index < contextTypes.length; index++) {
            result.push(new PetSpecification(contextColors[index], contextTypes[index], size));
        }
        return result;
    }
}
exports.PetSpecification = PetSpecification;
function storeCollectionAsMemento(context, collection) {
    var contextTypes = new Array(collection.length);
    var contextColors = new Array(collection.length);
    for (let index = 0; index < collection.length; index++) {
        contextTypes[index] = collection[index].type;
        contextColors[index] = collection[index].color;
    }
    context.globalState.update(EXTRA_PETS_KEY_TYPES, contextTypes);
    context.globalState.update(EXTRA_PETS_KEY_COLORS, contextColors);
    context.globalState.setKeysForSync([
        EXTRA_PETS_KEY_TYPES,
        EXTRA_PETS_KEY_COLORS,
    ]);
}
exports.storeCollectionAsMemento = storeCollectionAsMemento;
let petPlaygroundStatusBar;
let spawnPetStatusBar;
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('vscode-pets.start', () => {
        if (getConfigurationPosition() === "explorer" /* explorer */ &&
            webviewViewProvider) {
            vscode.commands.executeCommand('vscode-pets.petsView.focus');
        }
        else {
            const spec = PetSpecification.fromConfiguration();
            PetPanel.createOrShow(context.extensionUri, context.extensionPath, spec.color, spec.type, spec.size, getConfiguredTheme(), getConfiguredThemeKind());
            if (PetPanel.currentPanel) {
                var collection = PetSpecification.collectionFromMemento(context, getConfiguredSize());
                collection.forEach((item) => {
                    PetPanel.currentPanel.spawnPet(item);
                });
            }
        }
    }));
    // status bar item
    petPlaygroundStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    petPlaygroundStatusBar.command = 'vscode-pets.start';
    context.subscriptions.push(petPlaygroundStatusBar);
    spawnPetStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    spawnPetStatusBar.command = 'vscode-pets.spawn-pet';
    context.subscriptions.push(spawnPetStatusBar);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBar));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBar));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateExtensionPositionContext));
    updateStatusBar();
    const spec = PetSpecification.fromConfiguration();
    webviewViewProvider = new PetWebviewViewProvider(context.extensionUri, context.extensionPath, spec.color, spec.type, spec.size, getConfiguredTheme(), getConfiguredThemeKind());
    updateExtensionPositionContext();
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(PetWebviewViewProvider.viewType, webviewViewProvider));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-pets.throw-ball', () => {
        if (getConfigurationPosition() === "explorer" /* explorer */ &&
            webviewViewProvider) {
            webviewViewProvider.throwBall();
        }
        else {
            if (PetPanel.currentPanel) {
                PetPanel.currentPanel.throwBall();
            }
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-pets.delete-pets', () => {
        if (getConfigurationPosition() === "explorer" /* explorer */ &&
            webviewViewProvider) {
            webviewViewProvider.deletePet();
        }
        else if (PetPanel.currentPanel) {
            PetPanel.currentPanel.deletePet();
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-pets.spawn-pet', () => __awaiter(this, void 0, void 0, function* () {
        if (PetPanel.currentPanel ||
            getConfigurationPosition() === "explorer" /* explorer */) {
            const petType = yield vscode.window.showQuickPick(ALL_PETS, {
                placeHolder: 'Select a pet',
            });
            var petColor = DEFAULT_COLOR;
            var choices;
            switch (petType) {
                case "rubber-duck" /* rubberduck */:
                    petColor = "yellow" /* yellow */;
                    break;
                case "snake" /* snake */:
                    petColor = "green" /* green */;
                    break;
                case "rocky" /* rocky */:
                case "totoro" /* totoro */:
                    petColor = "gray" /* gray */;
                    break;
                case "cat" /* cat */:
                case "dog" /* dog */:
                    choices = ["black" /* black */, "brown" /* brown */];
                    petColor = (yield vscode.window.showQuickPick(choices, {
                        placeHolder: 'Select a color',
                    }));
                    break;
                case "clippy" /* clippy */:
                    choices = [
                        "black" /* black */,
                        "brown" /* brown */,
                        "green" /* green */,
                        "yellow" /* yellow */,
                    ];
                    petColor = (yield vscode.window.showQuickPick(choices, {
                        placeHolder: 'Select a color',
                    }));
                    break;
                case "crab" /* crab */:
                    petColor = "red" /* red */;
                    break;
                case "zappy" /* zappy */:
                    petColor = "yellow" /* yellow */;
                    break;
            }
            const spec = new PetSpecification(petColor, petType, getConfiguredSize());
            if (getConfigurationPosition() === "explorer" /* explorer */) {
                webviewViewProvider.spawnPet(spec);
            }
            else if (PetPanel.currentPanel) {
                PetPanel.currentPanel.spawnPet(spec);
            }
            var collection = PetSpecification.collectionFromMemento(context, getConfiguredSize());
            collection.push(spec);
            storeCollectionAsMemento(context, collection);
        }
        else {
            const spec = PetSpecification.fromConfiguration();
            PetPanel.createOrShow(context.extensionUri, context.extensionPath, spec.color, spec.type, spec.size, getConfiguredTheme(), getConfiguredThemeKind());
            if (PetPanel.currentPanel) {
                var collection = PetSpecification.collectionFromMemento(context, getConfiguredSize());
                collection.forEach((item) => {
                    PetPanel.currentPanel.spawnPet(item);
                });
            }
            else {
                var collection = PetSpecification.collectionFromMemento(context, getConfiguredSize());
                collection.push(spec);
                storeCollectionAsMemento(context, collection);
            }
            vscode.window.showInformationMessage("A Pet Playground has been created. You can now use the 'Spawn Pets Command!' to add more pets.");
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-pets.reset-pets', () => {
        if (getConfigurationPosition() === "explorer" /* explorer */ &&
            webviewViewProvider) {
            webviewViewProvider.resetPets();
            var collection = PetSpecification.collectionFromMemento(context, getConfiguredSize());
            collection.splice(0, collection.length);
            storeCollectionAsMemento(context, collection);
        }
        else if (PetPanel.currentPanel) {
            PetPanel.currentPanel.resetPets();
            var collection = PetSpecification.collectionFromMemento(context, getConfiguredSize());
            collection.splice(0, collection.length);
            storeCollectionAsMemento(context, collection);
        }
        else {
            vscode.window.showErrorMessage('Please Open a Pet Playground to Reset the Pets!');
        }
    }));
    // Listening to configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('vscode-pets.petColor') ||
            e.affectsConfiguration('vscode-pets.petType') ||
            e.affectsConfiguration('vscode-pets.petSize') ||
            e.affectsConfiguration('vscode-pets.theme') ||
            e.affectsConfiguration('workbench.colorTheme')) {
            const spec = PetSpecification.fromConfiguration();
            if (PetPanel.currentPanel) {
                PetPanel.currentPanel.updatePetColor(spec.color);
                PetPanel.currentPanel.updatePetSize(spec.size);
                PetPanel.currentPanel.updatePetType(spec.type);
                PetPanel.currentPanel.updateTheme(getConfiguredTheme(), getConfiguredThemeKind());
                PetPanel.currentPanel.update();
            }
            if (getConfigurationPosition() === "explorer" /* explorer */ &&
                webviewViewProvider) {
                webviewViewProvider.updatePetColor(spec.color);
                webviewViewProvider.updatePetSize(spec.size);
                webviewViewProvider.updatePetType(spec.type);
                webviewViewProvider.updateTheme(getConfiguredTheme(), getConfiguredThemeKind());
                webviewViewProvider.update();
            }
        }
        if (e.affectsConfiguration('vscode-pets.position')) {
            updateExtensionPositionContext();
        }
    }));
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(PetPanel.viewType, {
            deserializeWebviewPanel(webviewPanel, state) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Reset the webview options so we use latest uri for `localResourceRoots`.
                    webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                    const spec = PetSpecification.fromConfiguration();
                    PetPanel.revive(webviewPanel, context.extensionUri, context.extensionPath, spec.color, spec.type, spec.size, getConfiguredTheme(), getConfiguredThemeKind());
                });
            },
        });
    }
}
exports.activate = activate;
function updateStatusBar() {
    spawnPetStatusBar.text = `$(squirrel)`;
    spawnPetStatusBar.tooltip = 'Spawn Pet';
    spawnPetStatusBar.show();
}
function petPlaygroundDeactivate() {
    petPlaygroundStatusBar.dispose();
}
exports.petPlaygroundDeactivate = petPlaygroundDeactivate;
function spawnPetDeactivate() {
    spawnPetStatusBar.dispose();
}
exports.spawnPetDeactivate = spawnPetDeactivate;
function getWebviewOptions(extensionUri) {
    return {
        // Enable javascript in the webview
        enableScripts: true,
        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
    };
}
/**
 * Some pets can only have certain colors, this makes sure they haven't been misconfigured.
 * @param petColor
 * @param petType
 * @returns normalized color
 */
function normalizeColor(petColor, petType) {
    if (petType === "totoro" /* totoro */ || petType === "rocky" /* rocky */) {
        return "gray" /* gray */;
    }
    if (petType === "snake" /* snake */) {
        return "green" /* green */;
    }
    if (petType === "rubber-duck" /* rubberduck */ || petType === "zappy" /* zappy */) {
        return "yellow" /* yellow */;
    }
    if (petType === "crab" /* crab */) {
        return "red" /* red */;
    }
    if ((petType === "dog" /* dog */ || petType === "cat" /* cat */) &&
        petColor !== "brown" /* brown */ &&
        petColor !== "black" /* black */) {
        return "brown" /* brown */;
    }
    return petColor;
}
class PetWebviewContainer {
    constructor(extensionUri, extensionPath, color, type, size, theme, themeKind) {
        this._disposables = [];
        this._extensionUri = extensionUri;
        this._petMediaPath = path.join(extensionPath, 'media');
        this._petColor = color;
        this._petType = type;
        this._petSize = size;
        this._theme = theme;
        this._themeKind = themeKind;
    }
    petColor() {
        return normalizeColor(this._petColor, this._petType);
    }
    petType() {
        return this._petType;
    }
    petSize() {
        return this._petSize;
    }
    theme() {
        return this._theme;
    }
    themeKind() {
        return this._themeKind;
    }
    updatePetColor(newColor) {
        this._petColor = newColor;
    }
    updatePetType(newType) {
        this._petType = newType;
    }
    updatePetSize(newSize) {
        this._petSize = newSize;
    }
    updateTheme(newTheme, themeKind) {
        this._theme = newTheme;
        this._themeKind = themeKind;
    }
    throwBall() {
        this.getWebview().postMessage({ command: 'throw-ball' });
    }
    spawnPet(spec) {
        this.getWebview().postMessage({
            command: 'spawn-pet',
            type: spec.type,
            color: spec.color,
        });
        this.getWebview().postMessage({ command: 'set-size', size: spec.size });
    }
    deletePet() {
        this.getWebview().postMessage({ command: 'delete-pet' });
    }
    getWebview() {
        throw new Error('Not implemented');
    }
    _update() {
        const webview = this.getWebview();
        webview.html = this._getHtmlForWebview(webview);
    }
    update() {
        throw new Error('Not implemented');
    }
    _getHtmlForWebview(webview) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main-bundle.js');
        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
        const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'pets.css');
        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
        // Get path to resource on disk
        const basePetUri = webview.asWebviewUri(vscode.Uri.file(path.join(this._petMediaPath)));
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<title>VS Code Pets</title>
			</head>
			<body>
				<canvas id="petCanvas"></canvas>
				<div id="petsContainer"></div>
				<div id="foreground"></div>	
				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}">petApp.petPanelApp("${basePetUri}", "${this.theme()}", ${this.themeKind()}, "${this.petColor()}", "${this.petSize()}", "${this.petType()}");</script>
			</body>
			</html>`;
    }
}
function handleWebviewMessage(message) {
    switch (message.command) {
        case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        case 'info':
            vscode.window.showInformationMessage(message.text);
            return;
    }
}
/**
 * Manages pet coding webview panels
 */
class PetPanel extends PetWebviewContainer {
    constructor(panel, extensionUri, extensionPath, color, type, size, theme, themeKind) {
        super(extensionUri, extensionPath, color, type, size, theme, themeKind);
        this._panel = panel;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState((e) => {
            this.update();
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(handleWebviewMessage, null, this._disposables);
    }
    static createOrShow(extensionUri, extensionPath, petColor, petType, petSize, theme, themeKind) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        if (PetPanel.currentPanel) {
            if (petColor === PetPanel.currentPanel.petColor() &&
                petType === PetPanel.currentPanel.petType() &&
                petSize === PetPanel.currentPanel.petSize()) {
                PetPanel.currentPanel._panel.reveal(column);
                return;
            }
            else {
                PetPanel.currentPanel.updatePetColor(petColor);
                PetPanel.currentPanel.updatePetType(petType);
                PetPanel.currentPanel.updatePetSize(petSize);
                PetPanel.currentPanel.update();
            }
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(PetPanel.viewType, 'Pet Panel', vscode.ViewColumn.Two, getWebviewOptions(extensionUri));
        PetPanel.currentPanel = new PetPanel(panel, extensionUri, extensionPath, petColor, petType, petSize, theme, themeKind);
    }
    resetPets() {
        this.getWebview().postMessage({ command: 'reset-pet' });
    }
    deletePet() {
        this.getWebview().postMessage({ command: 'delete-pet' });
    }
    static revive(panel, extensionUri, extensionPath, petColor, petType, petSize, theme, themeKind) {
        PetPanel.currentPanel = new PetPanel(panel, extensionUri, extensionPath, petColor, petType, petSize, theme, themeKind);
    }
    dispose() {
        PetPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    update() {
        if (this._panel.visible) {
            this._update();
        }
    }
    getWebview() {
        return this._panel.webview;
    }
}
PetPanel.viewType = 'petCoding';
class PetWebviewViewProvider extends PetWebviewContainer {
    resolveWebviewView(webviewView, context, token) {
        this._webviewView = webviewView;
        webviewView.webview.options = getWebviewOptions(this._extensionUri);
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(handleWebviewMessage, null, this._disposables);
    }
    update() {
        this._update();
    }
    resetPets() {
        this.getWebview().postMessage({
            command: 'reset-pet',
            type: this.petType(),
            color: this.petColor(),
            size: this.petSize(),
        });
    }
    getWebview() {
        return this._webviewView.webview;
    }
}
PetWebviewViewProvider.viewType = 'vscode-pets.petsView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=extension.js.map