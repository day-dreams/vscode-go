/* eslint-disable no-useless-escape */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import cp = require('child_process');
import fs = require('fs');
import path = require('path');
<<<<<<< HEAD
=======
import util = require('util');
>>>>>>> origin/dev.go2go
import vscode = require('vscode');
import { CommandFactory } from './commands';
import { getGoConfig } from './config';
import { isModSupported } from './goModules';
<<<<<<< HEAD
import { getImportPathToFolder } from './goPackages';
import { getTestFlags, goTest, showTestOutput, TestConfig } from './testUtils';
import { fixDriveCasingInWindows } from './utils/pathUtils';
=======
import { envPath } from './goPath';
import { getTestFlags, goTest, showTestOutput, TestConfig } from './testUtils';
import { getBinPath, getCurrentGoPath, getGoConfig, getWorkspaceFolderPath } from './util';
>>>>>>> origin/dev.go2go

let gutterSvgs: { [key: string]: string };

interface Highlight {
	top: vscode.TextEditorDecorationType;
	mid: vscode.TextEditorDecorationType;
	bot: vscode.TextEditorDecorationType;
	all: vscode.TextEditorDecorationType;
}

let decorators: {
	type: 'highlight' | 'gutter';
	coveredGutter: vscode.TextEditorDecorationType;
	uncoveredGutter: vscode.TextEditorDecorationType;
	coveredHighlight: Highlight;
	uncoveredHighlight: Highlight;
};

let decoratorConfig: {
	[key: string]: any;
	type: 'highlight' | 'gutter';
	coveredHighlightColor: string;
	uncoveredHighlightColor: string;
	coveredBorderColor: string;
	uncoveredBorderColor: string;
	coveredGutterStyle: string;
	uncoveredGutterStyle: string;
};

// a list of modified, unsaved go files with actual code edits (rather than comment edits)
let modifiedFiles: {
	[key: string]: boolean;
} = {};

/**
 * Initializes the decorators used for Code coverage.
 * @param ctx The extension context
 */
export function initCoverageDecorators(ctx: vscode.ExtensionContext) {
	// Initialize gutter svgs
	gutterSvgs = {
		blockred: ctx.asAbsolutePath('media/gutter-blockred.svg'),
		blockgreen: ctx.asAbsolutePath('media/gutter-blockgreen.svg'),
		blockblue: ctx.asAbsolutePath('media/gutter-blockblue.svg'),
		blockyellow: ctx.asAbsolutePath('media/gutter-blockyellow.svg'),
		slashred: ctx.asAbsolutePath('media/gutter-slashred.svg'),
		slashgreen: ctx.asAbsolutePath('media/gutter-slashgreen.svg'),
		slashblue: ctx.asAbsolutePath('media/gutter-slashblue.svg'),
		slashyellow: ctx.asAbsolutePath('media/gutter-slashyellow.svg'),
		verticalred: ctx.asAbsolutePath('media/gutter-vertred.svg'),
		verticalgreen: ctx.asAbsolutePath('media/gutter-vertgreen.svg'),
		verticalblue: ctx.asAbsolutePath('media/gutter-vertblue.svg'),
		verticalyellow: ctx.asAbsolutePath('media/gutter-vertyellow.svg')
	};

	const goConfig = getGoConfig();
	updateCodeCoverageDecorators(goConfig.get('coverageDecorator'));
}

/**
 * Updates the decorators used for Code coverage.
 * @param coverageDecoratorConfig The coverage decorated as configured by the user
 */
export function updateCodeCoverageDecorators(coverageDecoratorConfig: any) {
	// These defaults are chosen to be distinguishable in nearly any color scheme (even Red)
	// as well as by people who have difficulties with color perception.
<<<<<<< HEAD
	// It appears that the contributions in package.json are only used to check what users
	// put in settings.json, while the defaults come from the defaults section of
	// go.coverageDecorator in package.json.
=======
	// (how do these relate the defaults in package.json?)
	// and where do the defaults actually come from? (raised as issue #256)
>>>>>>> origin/dev.go2go
	decoratorConfig = {
		type: 'highlight',
		coveredHighlightColor: 'rgba(64,128,128,0.5)',
		coveredBorderColor: 'rgba(64,128,128,1.0)',
		uncoveredHighlightColor: 'rgba(128,64,64,0.25)',
		uncoveredBorderColor: 'rgba(128,64,64,1.0)',
		coveredGutterStyle: 'blockblue',
		uncoveredGutterStyle: 'slashyellow'
	};

	// Update from configuration.
	if (typeof coverageDecoratorConfig !== 'object') {
		vscode.window.showWarningMessage("invalid go.coverageDecorator type, expected an 'object'");
	} else {
		for (const k in coverageDecoratorConfig) {
			if (coverageDecoratorConfig.hasOwnProperty(k)) {
				decoratorConfig[k] = coverageDecoratorConfig[k];
			} else {
				vscode.window.showWarningMessage(`invalid coverage parameter ${k}`);
			}
		}
	}
	setDecorators();
	vscode.window.visibleTextEditors.forEach(applyCodeCoverage);
}

function setDecorators() {
	disposeDecorators();
	if (!decorators) {
		initForTest();
	} // only happens in tests
	const f = (x: { overviewRulerColor: string; backgroundColor: string }, arg: string) => {
		const y = {
			overviewRulerLane: 2,
			borderStyle: arg,
			borderWidth: '2px'
		};
		return Object.assign(y, x);
	};
	const cov = {
		overviewRulerColor: 'green',
		backgroundColor: decoratorConfig.coveredHighlightColor,
		borderColor: decoratorConfig.coveredBorderColor
	};
	const uncov = {
		overviewRulerColor: 'red',
		backgroundColor: decoratorConfig.uncoveredHighlightColor,
		borderColor: decoratorConfig.uncoveredBorderColor
	};
	const ctop = f(cov, 'solid solid none solid');
	const cmid = f(cov, 'none solid none solid');
	const cbot = f(cov, 'none solid solid solid');
	const cone = f(cov, 'solid solid solid solid');
	const utop = f(uncov, 'solid solid none solid');
	const umid = f(uncov, 'none solid none solid');
	const ubot = f(uncov, 'none solid solid solid');
	const uone = f(uncov, 'solid solid solid solid');
	decorators = {
		type: decoratorConfig.type,
		coveredGutter: vscode.window.createTextEditorDecorationType({
			gutterIconPath: gutterSvgs[decoratorConfig.coveredGutterStyle]
		}),
		uncoveredGutter: vscode.window.createTextEditorDecorationType({
			gutterIconPath: gutterSvgs[decoratorConfig.uncoveredGutterStyle]
		}),
		coveredHighlight: {
			all: vscode.window.createTextEditorDecorationType(cone),
			top: vscode.window.createTextEditorDecorationType(ctop),
			mid: vscode.window.createTextEditorDecorationType(cmid),
			bot: vscode.window.createTextEditorDecorationType(cbot)
		},
		uncoveredHighlight: {
			all: vscode.window.createTextEditorDecorationType(uone),
			top: vscode.window.createTextEditorDecorationType(utop),
			mid: vscode.window.createTextEditorDecorationType(umid),
			bot: vscode.window.createTextEditorDecorationType(ubot)
		}
	};
}

/**
 * Disposes decorators so that the current coverage is removed from the editor.
 */
function disposeDecorators() {
	if (decorators) {
		decorators.coveredGutter.dispose();
		decorators.uncoveredGutter.dispose();
		decorators.coveredHighlight.all.dispose();
		decorators.coveredHighlight.top.dispose();
		decorators.coveredHighlight.mid.dispose();
		decorators.coveredHighlight.bot.dispose();
		decorators.uncoveredHighlight.all.dispose();
		decorators.uncoveredHighlight.top.dispose();
		decorators.uncoveredHighlight.mid.dispose();
		decorators.uncoveredHighlight.bot.dispose();
	}
}

interface CoverageData {
	uncoveredOptions: vscode.DecorationOptions[];
	coveredOptions: vscode.DecorationOptions[];
}

<<<<<<< HEAD
let coverageData: { [key: string]: CoverageData } = {}; // actual file path to the coverage data.
let isCoverageApplied = false;

function emptyCoverageData(): CoverageData {
	return {
		uncoveredOptions: [],
		coveredOptions: []
	};
}
=======
let coverageFiles: { [key: string]: CoverageData } = {};
let coveragePath = new Map<string, CoverageData>();
let pathsToDirs = new Map<string, string>();
let isCoverageApplied: boolean = false;
>>>>>>> origin/dev.go2go

/**
 * Clear the coverage on all files
 */
function clearCoverage() {
<<<<<<< HEAD
	coverageData = {};
=======
	coverageFiles = {};
	coveragePath = new Map<string, CoverageData>();
	pathsToDirs = new Map<string, string>();
>>>>>>> origin/dev.go2go
	disposeDecorators();
	isCoverageApplied = false;
}

/**
 * Extract the coverage data from the given cover profile & apply them on the files in the open editors.
 * @param coverProfilePath Path to the file that has the cover profile data
 * @param packageDirPath Absolute path of the package for which the coverage was calculated
<<<<<<< HEAD
 * @param dir Directory to execute go list in
 */
export function applyCodeCoverageToAllEditors(coverProfilePath: string, dir?: string): Promise<void> {
=======
 * @param testDir Directory to execute go list in, when there is no workspace, for some tests
 */
export function applyCodeCoverageToAllEditors(coverProfilePath: string, testDir?: string): Promise<void> {
>>>>>>> origin/dev.go2go
	const v = new Promise<void>((resolve, reject) => {
		try {
			const showCounts = getGoConfig().get('coverShowCounts') as boolean;
			const coveragePath = new Map<string, CoverageData>(); // <filename> from the cover profile to the coverage data.

			// Clear existing coverage files
			clearCoverage();

			// collect the packages named in the coverage file
			const seenPaths = new Set<string>();
			// for now read synchronously and hope for no errors
			const contents = fs.readFileSync(coverProfilePath).toString();
			contents.split('\n').forEach((line) => {
<<<<<<< HEAD
				// go test coverageprofile generates output:
				//    filename:StartLine.StartColumn,EndLine.EndColumn Hits CoverCount
				// where the filename is either the import path + '/' + base file name, or
				// the actual file path (either absolute or starting with .)
				// See https://golang.org/issues/40251.
				//
				// The first line will be like "mode: set" which we will ignore.
				// TODO: port https://golang.org/cl/179377 for faster parsing.

				const parse = line.match(/^(\S+)\:(\d+)\.(\d+)\,(\d+)\.(\d+)\s(\d+)\s(\d+)/);
				if (!parse) {
					return;
				}

				let filename = parse[1];
				if (filename.startsWith('.' + path.sep)) {
					// If it's a relative file path, convert it to an absolute path.
					// From now on, we can assume that it's a real file name if it is
					// an absolute path.
					filename = path.resolve(filename);
				}
				// If this is not a real file name, that's package_path + file name,
				// Record it in seenPaths for `go list` call to resolve package path ->
				// directory mapping.
				if (!path.isAbsolute(filename)) {
					const lastSlash = filename.lastIndexOf('/');
					if (lastSlash !== -1) {
						seenPaths.add(filename.slice(0, lastSlash));
					}
				}

				// and fill in coveragePath
				const coverage = coveragePath.get(parse[1]) || emptyCoverageData();
				// When line directive is used this information is artificial and
				// the source code file can be non-existent or wrong (go.dev/issues/41222).
				// There is no perfect way to guess whether the line/col in coverage profile
				// is bogus. At least, we know that 0 or negative values are not true line/col.
				const startLine = parseInt(parse[2], 10);
				const startCol = parseInt(parse[3], 10);
				const endLine = parseInt(parse[4], 10);
				const endCol = parseInt(parse[5], 10);
				if (startLine < 1 || startCol < 1 || endLine < 1 || endCol < 1) {
					return;
				}
				const range = new vscode.Range(
					// Convert lines and columns to 0-based
					startLine - 1,
					startCol - 1,
					endLine - 1,
					endCol - 1
				);

				const counts = parseInt(parse[7], 10);
				// If is Covered (CoverCount > 0)
				if (counts > 0) {
					coverage.coveredOptions.push(...elaborate(range, counts, showCounts));
				} else {
					coverage.uncoveredOptions.push(...elaborate(range, counts, showCounts));
				}

				coveragePath.set(filename, coverage);
			});

			getImportPathToFolder([...seenPaths], dir).then((pathsToDirs) => {
				createCoverageData(pathsToDirs, coveragePath);
=======
				const parse = line.match(/([^:]+)\:([\d]+)\.([\d]+)\,([\d]+)\.([\d]+)\s([\d]+)\s([\d]+)/);
				if (!parse) { return; }
				const lastSlash = parse[1].lastIndexOf('/'); // ok for windows?
				if (lastSlash !== -1) {
					seenPaths.add(parse[1].slice(0, lastSlash));
				}

				// and fill in coveragePath
				const coverage = getPathData(parse[1]);
				const range = new vscode.Range(
					// Start Line converted to zero based
					parseInt(parse[2], 10) - 1,
					// Start Column converted to zero based
					parseInt(parse[3], 10) - 1,
					// End Line converted to zero based
					parseInt(parse[4], 10) - 1,
					// End Column converted to zero based
					parseInt(parse[5], 10) - 1
				);
				// If is Covered (CoverCount > 0)
				if (parseInt(parse[7], 10) > 0) {
					coverage.coveredRange.push(range);
				} else {
					coverage.uncoveredRange.push(range);
				}
				setPathData(parse[1], coverage);
			});
			const pathPromise = getPathsToDirs(seenPaths, pathsToDirs, testDir);
			pathPromise.then(() => {
				createCoverageData();
>>>>>>> origin/dev.go2go
				setDecorators();
				vscode.window.visibleTextEditors.forEach(applyCodeCoverage);
				resolve();
			});
		} catch (e) {
			vscode.window.showInformationMessage((e as any).msg);
			reject(e);
		}
	});
	return v;
}

// add decorations to the range
function elaborate(r: vscode.Range, count: number, showCounts: boolean): vscode.DecorationOptions[] {
	// irrelevant for "gutter"
	if (!decorators || decorators.type === 'gutter') {
		return [{ range: r }];
	}
	const ans: vscode.DecorationOptions[] = [];
	const dc = decoratorConfig;
	const backgroundColor = [dc.uncoveredHighlightColor, dc.coveredHighlightColor];
	const txt: vscode.ThemableDecorationAttachmentRenderOptions = {
		contentText: count > 0 && showCounts ? `--${count}--` : '',
		backgroundColor: backgroundColor[count === 0 ? 0 : 1]
	};
	const v: vscode.DecorationOptions = {
		range: r,
		hoverMessage: `${count} executions`,
		renderOptions: {
			before: txt
		}
	};
	ans.push(v);
	return ans;
}

function createCoverageData(pathsToDirs: Map<string, string>, coveragePath: Map<string, CoverageData>) {
	coveragePath.forEach((cd, ip) => {
		if (path.isAbsolute(ip)) {
			setCoverageDataByFilePath(ip, cd);
			return;
		}

		const lastSlash = ip.lastIndexOf('/');
		if (lastSlash === -1) {
			setCoverageDataByFilePath(ip, cd);
			return;
		}

		const maybePkgPath = ip.slice(0, lastSlash);
		const fileDir = pathsToDirs.get(maybePkgPath) || path.resolve(maybePkgPath);
		const file = fileDir + path.sep + ip.slice(lastSlash + 1);
		setCoverageDataByFilePath(file, cd);
	});
}

/**
 * Get the CoverageData for an import path.
 * @param importPath
 */
function getPathData(importPath: string): CoverageData {
	return coveragePath.get(importPath) || { coveredRange: [], uncoveredRange: [] };
}

/**
 * Set the CoverageData for an import path.
 * @param importPath
 * @param data
 */
function setPathData(importPath: string, data: CoverageData) {
	coveragePath.set(importPath, data);
}

function createCoverageData() {
	coveragePath.forEach((cd, ip) => {
		const lastSlash = ip.lastIndexOf('/');
		const importPath = ip.slice(0, lastSlash);
		const fileDir = pathsToDirs.get(importPath);
		const file = fileDir + ip.slice(lastSlash); // what about Windows?
		setCoverageData(file, cd);
	});
}

/**
 * Set the object that holds the coverage data for given file path.
 * @param filePath
 * @param data
 */
function setCoverageDataByFilePath(filePath: string, data: CoverageData) {
	if (filePath.startsWith('_')) {
		filePath = filePath.substr(1);
	}
	if (process.platform === 'win32') {
		const parts = filePath.split('/');
		if (parts.length) {
			filePath = parts.join(path.sep);
		}
	}
	coverageData[filePath] = data;
}

/**
 * Apply the code coverage highlighting in given editor
 * @param editor
 */
export function applyCodeCoverage(editor: vscode.TextEditor | undefined) {
	if (!editor || editor.document.languageId !== 'go' || editor.document.fileName.endsWith('_test.go')) {
		return;
	}
	let doc = editor.document.fileName;
	if (path.isAbsolute(doc)) {
		doc = fixDriveCasingInWindows(doc);
	}

	const cfg = getGoConfig(editor.document.uri);
	const coverageOptions = cfg['coverageOptions'];
	for (const filename in coverageData) {
		if (doc !== fixDriveCasingInWindows(filename)) {
			continue;
		}
		isCoverageApplied = true;
		const cd = coverageData[filename];
		if (coverageOptions === 'showCoveredCodeOnly' || coverageOptions === 'showBothCoveredAndUncoveredCode') {
			if (decorators.type === 'gutter') {
				editor.setDecorations(decorators.coveredGutter, cd.coveredOptions);
			} else {
				detailed(editor, decorators.coveredHighlight, cd.coveredOptions);
			}
		}

		if (coverageOptions === 'showUncoveredCodeOnly' || coverageOptions === 'showBothCoveredAndUncoveredCode') {
			if (decorators.type === 'gutter') {
				editor.setDecorations(decorators.uncoveredGutter, cd.uncoveredOptions);
			} else {
				detailed(editor, decorators.uncoveredHighlight, cd.uncoveredOptions);
			}
		}
	}
}

function detailed(editor: vscode.TextEditor, h: Highlight, opts: vscode.DecorationOptions[]) {
	const tops: vscode.DecorationOptions[] = [];
	const mids: vscode.DecorationOptions[] = [];
	const bots: vscode.DecorationOptions[] = [];
	const alls: vscode.DecorationOptions[] = [];
	opts.forEach((opt) => {
		const r = opt.range;
		if (r.start.line === r.end.line) {
			alls.push(opt);
			return;
		}
		for (let line = r.start.line; line <= r.end.line; line++) {
			if (line === r.start.line) {
				const use: vscode.DecorationOptions = {
					range: editor.document.validateRange(
						new vscode.Range(line, r.start.character, line, Number.MAX_SAFE_INTEGER)
					),
					hoverMessage: opt.hoverMessage,
					renderOptions: opt.renderOptions
				};
				tops.push(use);
			} else if (line < r.end.line) {
				const use = {
					range: editor.document.validateRange(new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER)),
					hoverMessage: opt.hoverMessage
				};
				mids.push(use);
			} else {
				const use = {
					range: new vscode.Range(line, 0, line, r.end.character),
					hoverMessage: opt.hoverMessage
				};
				bots.push(use);
			}
		}
	});
	if (tops.length > 0) {
		editor.setDecorations(h.top, tops);
	}
	if (mids.length > 0) {
		editor.setDecorations(h.mid, mids);
	}
	if (bots.length > 0) {
		editor.setDecorations(h.bot, bots);
	}
	if (alls.length > 0) {
		editor.setDecorations(h.all, alls);
	}
}

/**
 * Listener for file save that clears potential stale coverage data.
 * Local cache tracks files with changes outside of comments to determine
 * files for which the save event can cause stale coverage data.
 * @param e TextDocument
 */
export function removeCodeCoverageOnFileSave(e: vscode.TextDocument) {
	if (e.languageId !== 'go' || !isCoverageApplied) {
		return;
	}

	if (vscode.window.visibleTextEditors.every((editor) => editor.document !== e)) {
		return;
	}

	if (modifiedFiles[e.fileName]) {
		clearCoverage();
		modifiedFiles = {}; // reset the list of modified files
	}
}

/**
 * Listener for file change that tracks files with changes outside of comments
 * to determine files for which an eventual save can cause stale coverage data.
 * @param e TextDocumentChangeEvent
 */
export function trackCodeCoverageRemovalOnFileChange(e: vscode.TextDocumentChangeEvent) {
	if (e.document.languageId !== 'go' || !e.contentChanges.length || !isCoverageApplied) {
		return;
	}

	if (vscode.window.visibleTextEditors.every((editor) => editor.document !== e.document)) {
		return;
	}

	if (isPartOfComment(e)) {
		return;
	}

	modifiedFiles[e.document.fileName] = true;
}

/**
 * Fill the map of directory paths corresponding to input package paths
 * @param set Set<string> of import package paths
 */
async function getPathsToDirs(set: Set<string>, res: Map<string, string>, testDir?: string) {
	const goRuntimePath = getBinPath('go');
	if (!goRuntimePath) {
		vscode.window.showErrorMessage(
			`Failed to run, as the "go" binary cannot be found in either GOROOT(${process.env['GOROOT']}) or PATH(${envPath})`
		);
	}
	const args: string[] = ['list', '-f', '{{.ImportPath}}:{{.Dir}}'];
	set.forEach((s) => args.push(s));

	const options: { [key: string]: any } = {
		env: Object.assign({}, process.env, { GOPATH: getCurrentGoPath() })
	};
	const workDir = getWorkspaceFolderPath();
	// If there is a workDir then probably it is what we want
	// Otherwise maybe a test suggested a directory.
	if (workDir) {
		options['cwd'] = workDir;
	} else if (testDir) {
		options['cwd'] = testDir;
	}

	const execFile = util.promisify(cp.execFile);
	const { stdout } = await execFile(goRuntimePath, args, options);
	stdout.split('\n').forEach((line) => {
		const flds = line.split(':');
		if (flds.length !== 2) { return; }
		res.set(flds[0], flds[1]);
	});
}

/**
 * If current editor has Code coverage applied, then remove it.
 * Else run tests to get the coverage and apply.
 */
export const toggleCoverageCurrentPackage: CommandFactory = () => async () => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showInformationMessage('No editor is active.');
		return;
	}

	if (isCoverageApplied) {
		clearCoverage();
		return;
	}

	const goConfig = getGoConfig();
	const cwd = path.dirname(editor.document.uri.fsPath);

	const testFlags = getTestFlags(goConfig);
	const isMod = await isModSupported(editor.document.uri);
	const testConfig: TestConfig = {
		goConfig,
		dir: cwd,
		flags: testFlags,
		background: true,
		isMod,
		applyCodeCoverage: true
	};

	return goTest(testConfig).then((success) => {
		if (!success) {
			showTestOutput();
		}
	});
};

export function isPartOfComment(e: vscode.TextDocumentChangeEvent): boolean {
	return e.contentChanges.every((change) => {
		// We cannot be sure with using just regex on individual lines whether a multi line change is part of a comment or not
		// So play it safe and treat it as not a comment
		if (!change.range.isSingleLine || change.text.includes('\n')) {
			return false;
		}

		const text = e.document.lineAt(change.range.start).text;
		const idx = text.search('//');
		return idx > -1 && idx <= change.range.start.character;
	});
}

// These routines enable testing without starting an editing session.

<<<<<<< HEAD
export function coverageFilesForTest(): { [key: string]: CoverageData } {
	return coverageData;
=======
export function coverageFilesForTest():  { [key: string]: CoverageData; } {
	return coverageFiles;
>>>>>>> origin/dev.go2go
}

export function initForTest() {
	if (!decoratorConfig) {
		// this code is unnecessary except for testing, where there may be no workspace
		// nor the normal flow of initializations
		const x = 'rgba(0,0,0,0)';
		if (!gutterSvgs) {
			gutterSvgs = { x };
		}
		decoratorConfig = {
			type: 'highlight',
			coveredHighlightColor: x,
			uncoveredHighlightColor: x,
<<<<<<< HEAD
			coveredBorderColor: x,
			uncoveredBorderColor: x,
=======
>>>>>>> origin/dev.go2go
			coveredGutterStyle: x,
			uncoveredGutterStyle: x
		};
	}
}
