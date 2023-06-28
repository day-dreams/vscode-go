/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import cp = require('child_process');
import { dirname } from 'path';
import { toolExecutionEnvironment } from './goEnv';
import { promptForMissingTool } from './goInstallTools';
import { getBinPath } from './util';
import vscode = require('vscode');

	constructor(symbol: vscode.SymbolInformation) {
		this.label = symbol.name;
		this.description = symbol.containerName;
		this.name = symbol.name.split('.').pop(); // in case, symbol contains package name.
		this.package = symbol.containerName;
	}
}

export const implCursor: CommandFactory = () => () => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor found.');
		return;
	}
	const cursor = editor.selection;
	return vscode.window
		.showInputBox({
			placeHolder: 'f *File io.Closer',
			prompt: 'Enter receiver and interface to implement.'
		})
		.then((implInput) => {
			if (typeof implInput === 'undefined') {
				return;
			}
			const matches = implInput.match(inputRegex);
			if (!matches) {
				vscode.window.showInformationMessage(`Not parsable input: ${implInput}`);
				return;
			}

			// TODO: automatically detect type name at cursor
			// if matches[1] is undefined then detect receiver type
			// take first character and use as receiver name

			runGoImpl([matches[1], matches[2]], cursor.start, editor);
		});
}

function runGoImpl(args: string[], insertPos: vscode.Position, editor: vscode.TextEditor) {
	const goimpl = getBinPath('impl');
	const p = cp.execFile(
		goimpl,
		args,
		{ env: toolExecutionEnvironment(), cwd: dirname(editor.document.fileName) },
		(err, stdout, stderr) => {
			if (err && (<any>err).code === 'ENOENT') {
				promptForMissingTool('impl');
				return;
			}

			if (err) {
				vscode.window.showInformationMessage(`Cannot stub interface: ${stderr}`);
				return;
			}

			// replace ReceiverName_ and Receiver__ with placeholders
			let stub = '\n' + stdout + '\n';
			stub = stub.replace(new RegExp('ReceiverName__', 'g'), '${0:r}');
			stub = stub.replace(new RegExp('Receiver__', 'g'), '${1:receiver}');

			const snippet = new vscode.SnippetString(stub);
			editor.insertSnippet(snippet, insertPos);
		}
	);
	if (p.pid) {
		p.stdin?.end();
	}
}
