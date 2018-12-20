'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.identifierToPhrase', identifierToPhraseString);

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.phrasToIdentifier', phraseStringToIdentifier);

    context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
export function deactivate() {
}

const javascriptIdentifierCharRegExp = /[_a-z0-9$]/i;

function identifierToPhraseString() {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;

    if (selections.length === 1) {
        if (selections.every((selection) => selection.active.isEqual(selection.anchor))) {
            const document = editor.document;
            const line = document.lineAt(selections[0].active.line);
            const text = line.text;

            let left: number = selections[0].active.character;
            let right: number = selections[0].active.character;
            for (let i = selections[0].active.character - 1; i >=0; i--) {
                if(javascriptIdentifierCharRegExp.test(text.charAt(i))) {
                    left = i;
                } else {
                    break;
                }
            }

            for (let i = selections[0].active.character; i < text.length; i++) {
                if(javascriptIdentifierCharRegExp.test(text.charAt(i))) {
                    right = i;
                } else {
                    break;
                }
            }

            if (left !== right) {
                let phraseString = text.substring(left, right + 1)
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^[a-z]/, fc => fc.toUpperCase())
                    .replace(/(.+)/g, '\'$1\'');
                replace(editor, line, left, right, phraseString);
            }
        }
    }
}

function phraseStringToIdentifier() {
    const editor = vscode.window.activeTextEditor;
    const selections = editor.selections;

    if (selections.length === 1) {
        if (selections.every((selection) => selection.active.isEqual(selection.anchor))) {
            const document = editor.document;
            const line = document.lineAt(selections[0].active.line);
            const text = line.text;

            let left: number = -1;
            let right: number = -1;
            for (let i = selections[0].active.character - 1; i >=0; i--) {
                if(text.charAt(i) == '\'') {
                    left = i;
                    break;
                }
            }

            for (let i = selections[0].active.character; i < text.length; i++) {
                if(text.charAt(i) == '\'') {
                    right = i;
                    break;
                }
            }

            if (left !== -1 && right !== -1) {
                let identifier = text.substring(left, right + 1)
                    .replace(/ [a-z]/, spaceFc => spaceFc.toUpperCase())
                    .replace(/^'/, '')
                    .replace(/'$/, '')
                    .replace(/ /g, '')
                    .replace(/[A-Z]/, spaceFc => spaceFc.toLowerCase());
                replace(editor, line, left, right, identifier);
            }
        }
    }
}

function replace(editor: vscode.TextEditor, line: vscode.TextLine, left: number, right: number, replaceText: string) {
    editor.edit((editBuilder) => {
        editBuilder.replace(new vscode.Range(new vscode.Position(line.lineNumber, left), new vscode.Position(line.lineNumber, right+1)), replaceText);
    });
}
