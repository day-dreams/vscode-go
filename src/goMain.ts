/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Modification copyright 2020 The Go Authors. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

<<<<<<< HEAD
import { getGoConfig } from './config';
import { browsePackages } from './goBrowsePackage';
import { buildCode } from './goBuild';
import { notifyIfGeneratedFile, removeTestStatus } from './goCheck';
=======
import * as path from 'path';
import vscode = require('vscode');
import { GoDlvDapDebugSession } from './debugAdapter2/goDlvDebug';
import { browsePackages } from './goBrowsePackage';
import { buildCode } from './goBuild';
import { check, notifyIfGeneratedFile, removeTestStatus } from './goCheck';
>>>>>>> origin/dev.go2go
import {
	applyCodeCoverage,
	initCoverageDecorators,
	removeCodeCoverageOnFileSave,
	toggleCoverageCurrentPackage,
	trackCodeCoverageRemovalOnFileChange,
	updateCodeCoverageDecorators
} from './goCover';
import { GoDebugConfigurationProvider } from './goDebugConfiguration';
<<<<<<< HEAD
import * as GoDebugFactory from './goDebugFactory';
import { setGOROOTEnvVar, toolExecutionEnvironment } from './goEnv';
import {
	chooseGoEnvironment,
	offerToInstallLatestGoVersion,
	setEnvironmentVariableCollection
} from './goEnvironmentStatus';
=======
import { extractFunction, extractVariable } from './goDoctor';
import { toolExecutionEnvironment } from './goEnv';
import { chooseGoEnvironment } from './goEnvironmentStatus';
import { runFillStruct } from './goFillStruct';
>>>>>>> origin/dev.go2go
import * as goGenerateTests from './goGenerateTests';
import { goGetPackage } from './goGetPackage';
import { addImport, addImportToWorkspace } from './goImport';
import { installCurrentPackage } from './goInstall';
import { offerToInstallTools, promptForMissingTool, updateGoVarsFromConfig, suggestUpdates } from './goInstallTools';
import { RestartReason, showServerOutputChannel, watchLanguageServerConfiguration } from './language/goLanguageServer';
import { lintCode } from './goLint';
import { setLogConfig } from './goLogging';
import { GO_MODE } from './goMode';
<<<<<<< HEAD
import { GO111MODULE, goModInit, isModSupported } from './goModules';
=======
import { addTags, removeTags } from './goModifytags';
import { GO111MODULE, isModSupported } from './goModules';
import { clearCacheForTools, fileExists, getCurrentGoRoot, setCurrentGoRoot } from './goPath';
>>>>>>> origin/dev.go2go
import { playgroundCommand } from './goPlayground';
import { GoRunTestCodeLensProvider } from './goRunTestCodelens';
import { disposeGoStatusBar, expandGoStatusBar, outputChannel, updateGoStatusBar } from './goStatus';

import { vetCode } from './goVet';
import {
	getFromGlobalState,
	resetGlobalState,
	resetWorkspaceState,
	setGlobalState,
	setWorkspaceState,
	updateGlobalState
} from './stateUtils';
import { cancelRunningTests, showTestOutput } from './testUtils';
<<<<<<< HEAD
import { cleanupTempDir, getBinPath, getToolsGopath, isGoPathSet, resolvePath } from './util';
import { clearCacheForTools } from './utils/pathUtils';
import { WelcomePanel } from './welcome';
import vscode = require('vscode');
import { getFormatTool } from './language/legacy/goFormat';
import { resetSurveyConfigs, showSurveyConfig } from './goSurvey';
import { ExtensionAPI } from './export';
import extensionAPI from './extensionAPI';
import { GoTestExplorer, isVscodeTestingAPIAvailable } from './goTest/explore';
import { killRunningPprof } from './goTest/profile';
import { GoExplorerProvider } from './goExplorer';
import { GoExtensionContext } from './context';
import * as commands from './commands';
import { toggleVulncheckCommandFactory, VulncheckOutputLinkProvider } from './goVulncheck';
import { GoTaskProvider } from './goTaskProvider';
=======
import {
	cleanupTempDir,
	getBinPath,
	getCurrentGoPath,
	getExtensionCommands,
	getGoConfig,
	getGoVersion,
	getToolsGopath,
	getWorkspaceFolderPath,
	handleDiagnosticErrors,
	isGoPathSet
} from './util';
>>>>>>> origin/dev.go2go

const goCtx: GoExtensionContext = {};

export async function activate(ctx: vscode.ExtensionContext): Promise<ExtensionAPI | undefined> {
	if (process.env['VSCODE_GO_IN_TEST'] === '1') {
		// Make sure this does not run when running in test.
		return;
	}

	setGlobalState(ctx.globalState);
	setWorkspaceState(ctx.workspaceState);
<<<<<<< HEAD
	setEnvironmentVariableCollection(ctx.environmentVariableCollection);

	const cfg = getGoConfig();
	setLogConfig(cfg['logging']);

	WelcomePanel.activate(ctx, goCtx);
=======
	const configGOROOT = getGoConfig()['goroot'];
	if (!!configGOROOT) {
		setCurrentGoRoot(configGOROOT);
	}

	updateGoVarsFromConfig().then(async () => {
		const updateToolsCmdText = 'Update tools';
		interface GoInfo {
			goroot: string;
			version: string;
		}
		const toolsGoInfo: { [id: string]: GoInfo } = ctx.globalState.get('toolsGoInfo') || {};
		const toolsGopath = getToolsGopath() || getCurrentGoPath();
		if (!toolsGoInfo[toolsGopath]) {
			toolsGoInfo[toolsGopath] = { goroot: null, version: null };
		}
		const prevGoroot = toolsGoInfo[toolsGopath].goroot;
		const currentGoroot: string = getCurrentGoRoot().toLowerCase();
		if (prevGoroot && prevGoroot.toLowerCase() !== currentGoroot) {
			// Don't suggest recompiling tools for the go2go version.
			if (false) {
				vscode.window.showInformationMessage(
					`Your current goroot (${currentGoroot}) is different than before (${prevGoroot}), a few Go tools may need recompiling`,
					updateToolsCmdText
				)
					.then((selected) => {
						if (selected === updateToolsCmdText) {
							installAllTools(true);
						}
					});
			}
		} else {
			const currentVersion = await getGoVersion();
			if (currentVersion) {
				const prevVersion = toolsGoInfo[toolsGopath].version;
				const currVersionString = currentVersion.format();

				if (prevVersion !== currVersionString) {
					if (prevVersion) {
						vscode.window
							.showInformationMessage(
								'Your Go version is different than before, a few Go tools may need re-compiling',
								updateToolsCmdText
							)
							.then((selected) => {
								if (selected === updateToolsCmdText) {
									installAllTools(true);
								}
							});
					}
					toolsGoInfo[toolsGopath].version = currVersionString;
				}
			}
		}
		toolsGoInfo[toolsGopath].goroot = currentGoroot;
		ctx.globalState.update('toolsGoInfo', toolsGoInfo);
>>>>>>> origin/dev.go2go

	const configGOROOT = getGoConfig()['goroot'];
	if (configGOROOT) {
		// We don't support unsetting go.goroot because we don't know whether
		// !configGOROOT case indicates the user wants to unset process.env['GOROOT']
		// or the user wants the extension to use the current process.env['GOROOT'] value.
		// TODO(hyangah): consider utilizing an empty value to indicate unset?
		await setGOROOTEnvVar(configGOROOT);
	}

	await showDeprecationWarning();
	await updateGoVarsFromConfig(goCtx);

	suggestUpdates();
	offerToInstallLatestGoVersion();
	offerToInstallTools();

	const registerCommand = commands.createRegisterCommand(ctx, goCtx);
	registerCommand('go.languageserver.restart', commands.startLanguageServer);

	await commands.startLanguageServer(ctx, goCtx)(RestartReason.ACTIVATION);

	initCoverageDecorators(ctx);

	registerCommand('go.builds.run', commands.runBuilds);

	const activeDoc = vscode.window.activeTextEditor?.document;
	if (!goCtx.languageServerIsRunning && activeDoc?.languageId === 'go' && isGoPathSet()) {
		// Check mod status so that cache is updated and then run build/lint/vet
		isModSupported(activeDoc.uri).then(() => {
			vscode.commands.executeCommand('go.builds.run', activeDoc, getGoConfig(activeDoc.uri));
		});
	}

	registerCommand('go.environment.status', expandGoStatusBar);

	GoRunTestCodeLensProvider.activate(ctx, goCtx);
	GoDebugConfigurationProvider.activate(ctx, goCtx);
	GoDebugFactory.activate(ctx);

	goCtx.buildDiagnosticCollection = vscode.languages.createDiagnosticCollection('go');
	ctx.subscriptions.push(goCtx.buildDiagnosticCollection);
	goCtx.lintDiagnosticCollection = vscode.languages.createDiagnosticCollection(
		lintDiagnosticCollectionName(getGoConfig()['lintTool'])
	);
<<<<<<< HEAD
	ctx.subscriptions.push(goCtx.lintDiagnosticCollection);
	goCtx.vetDiagnosticCollection = vscode.languages.createDiagnosticCollection('go-vet');
	ctx.subscriptions.push(goCtx.vetDiagnosticCollection);

	registerCommand('go.gopath', commands.getCurrentGoPath);
	registerCommand('go.goroot', commands.getCurrentGoRoot);
	registerCommand('go.locate.tools', commands.getConfiguredGoTools);
	registerCommand('go.add.tags', commands.addTags);
	registerCommand('go.remove.tags', commands.removeTags);
	registerCommand('go.fill.struct', commands.runFillStruct);
	registerCommand('go.impl.cursor', commands.implCursor);
	registerCommand('go.godoctor.extract', commands.extractFunction);
	registerCommand('go.godoctor.var', commands.extractVariable);
	registerCommand('go.test.cursor', commands.testAtCursor('test'));
	registerCommand('go.test.cursorOrPrevious', commands.testAtCursorOrPrevious('test'));
	registerCommand('go.subtest.cursor', commands.subTestAtCursor('test'));
	registerCommand('go.debug.cursor', commands.testAtCursor('debug'));
	registerCommand('go.debug.subtest.cursor', commands.subTestAtCursor('debug'));
	registerCommand('go.benchmark.cursor', commands.testAtCursor('benchmark'));
	registerCommand('go.test.package', commands.testCurrentPackage(false));
	registerCommand('go.benchmark.package', commands.testCurrentPackage(true));
	registerCommand('go.test.file', commands.testCurrentFile(false));
	registerCommand('go.benchmark.file', commands.testCurrentFile(true));
	registerCommand('go.test.workspace', commands.testWorkspace);
	registerCommand('go.test.previous', commands.testPrevious);
	registerCommand('go.debug.previous', commands.debugPrevious);

	registerCommand('go.test.coverage', toggleCoverageCurrentPackage);
	registerCommand('go.test.showOutput', () => showTestOutput);
	registerCommand('go.test.cancel', () => cancelRunningTests);
	registerCommand('go.import.add', addImport);
	registerCommand('go.add.package.workspace', addImportToWorkspace);
	registerCommand('go.tools.install', commands.installTools);
	registerCommand('go.browse.packages', browsePackages);
=======
	const testCodeLensProvider = new GoRunTestCodeLensProvider();
	const referencesCodeLensProvider = new GoReferencesCodeLensProvider();

	ctx.subscriptions.push(vscode.languages.registerCodeLensProvider(GO_MODE, testCodeLensProvider));
	ctx.subscriptions.push(vscode.languages.registerCodeLensProvider(GO_MODE, referencesCodeLensProvider));
	ctx.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('go', new GoDebugConfigurationProvider()));
	ctx.subscriptions.push(
		vscode.debug.registerDebugConfigurationProvider('godlvdap', new GoDebugConfigurationProvider()));

	// Use an InlineDebugAdapterFactory to create a new debug adapter for
	// the 'godlvdap' command in inline mode, without launching a subprocess.
	const factory = new InlineDebugAdapterFactory();
	ctx.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('godlvdap', factory));
	if ('dispose' in factory) {
		ctx.subscriptions.push(factory);
	}
>>>>>>> origin/dev.go2go

	if (isVscodeTestingAPIAvailable && cfg.get<boolean>('testExplorer.enable')) {
		GoTestExplorer.setup(ctx, goCtx);
	}

	GoExplorerProvider.setup(ctx);

	registerCommand('go.test.generate.package', goGenerateTests.generateTestCurrentPackage);
	registerCommand('go.test.generate.file', goGenerateTests.generateTestCurrentFile);
	registerCommand('go.test.generate.function', goGenerateTests.generateTestCurrentFunction);
	registerCommand('go.toggle.test.file', goGenerateTests.toggleTestFile);
	registerCommand('go.debug.startSession', commands.startDebugSession);
	registerCommand('go.show.commands', commands.showCommands);
	registerCommand('go.get.package', goGetPackage);
	registerCommand('go.playground', playgroundCommand);
	registerCommand('go.lint.package', lintCode('package'));
	registerCommand('go.lint.workspace', lintCode('workspace'));
	registerCommand('go.lint.file', lintCode('file'));
	registerCommand('go.vet.package', vetCode(false));
	registerCommand('go.vet.workspace', vetCode(true));
	registerCommand('go.build.package', buildCode(false));
	registerCommand('go.build.workspace', buildCode(true));
	registerCommand('go.install.package', installCurrentPackage);
	registerCommand('go.run.modinit', goModInit);
	registerCommand('go.extractServerChannel', showServerOutputChannel);
	registerCommand('go.workspace.resetState', resetWorkspaceState);
	registerCommand('go.global.resetState', resetGlobalState);
	registerCommand('go.toggle.gc_details', commands.toggleGCDetails);
	registerCommand('go.apply.coverprofile', commands.applyCoverprofile);

	// Go Environment switching commands
	registerCommand('go.environment.choose', chooseGoEnvironment);

	// Survey related commands
	registerCommand('go.survey.showConfig', showSurveyConfig);
	registerCommand('go.survey.resetConfig', resetSurveyConfigs);

	addOnDidChangeConfigListeners(ctx);
	addOnChangeTextDocumentListeners(ctx);
	addOnChangeActiveTextEditorListeners(ctx);
	addOnSaveTextDocumentListeners(ctx);

	vscode.languages.setLanguageConfiguration(GO_MODE.language, {
		wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]+)/g
	});

	GoTaskProvider.setup(ctx, vscode.workspace);

	// Vulncheck output link provider.
	VulncheckOutputLinkProvider.activate(ctx);
	registerCommand('go.vulncheck.toggle', toggleVulncheckCommandFactory);

	return extensionAPI;
}

export function deactivate() {
	return Promise.all([
		goCtx.languageClient?.stop(),
		cancelRunningTests(),
		killRunningPprof(),
		Promise.resolve(cleanupTempDir()),
		Promise.resolve(disposeGoStatusBar())
	]);
}

function addOnDidChangeConfigListeners(ctx: vscode.ExtensionContext) {
	// Subscribe to notifications for changes to the configuration
	// of the language server, even if it's not currently in use.
	ctx.subscriptions.push(
<<<<<<< HEAD
		vscode.workspace.onDidChangeConfiguration((e) => watchLanguageServerConfiguration(goCtx, e))
	);
	ctx.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(async (e: vscode.ConfigurationChangeEvent) => {
=======
		vscode.commands.registerCommand('go.gopath', () => {
			const gopath = getCurrentGoPath();
			let msg = `${gopath} is the current GOPATH.`;
			const wasInfered = getGoConfig()['inferGopath'];
			const root = getWorkspaceFolderPath(
				vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri
			);

			// not only if it was configured, but if it was successful.
			if (wasInfered && root && root.indexOf(gopath) === 0) {
				const inferredFrom = vscode.window.activeTextEditor ? 'current folder' : 'workspace root';
				msg += ` It is inferred from ${inferredFrom}`;
			}

			vscode.window.showInformationMessage(msg);
			return gopath;
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.locate.tools', async () => {
			outputChannel.show();
			outputChannel.clear();
			outputChannel.appendLine('Checking configured tools....');
			// Tool's path search is done by getBinPathWithPreferredGopath
			// which searches places in the following order
			// 1) absolute path for the alternateTool
			// 2) GOBIN
			// 3) toolsGopath
			// 4) gopath
			// 5) GOROOT
			// 6) PATH
			outputChannel.appendLine('GOBIN: ' + process.env['GOBIN']);
			outputChannel.appendLine('toolsGopath: ' + getToolsGopath());
			outputChannel.appendLine('gopath: ' + getCurrentGoPath());
			outputChannel.appendLine('GOROOT: ' + getCurrentGoRoot());
			outputChannel.appendLine('PATH: ' + process.env['PATH']);
			outputChannel.appendLine('');

			const goVersion = await getGoVersion();
			const allTools = getConfiguredTools(goVersion);

			allTools.forEach((tool) => {
				const toolPath = getBinPath(tool.name);
				// TODO(hyangah): print alternate tool info if set.
				let msg = 'not installed';
				if (path.isAbsolute(toolPath)) {
					// getBinPath returns the absolute path is the tool exists.
					// (See getBinPathWithPreferredGopath which is called underneath)
					msg = 'installed';
				}
				outputChannel.appendLine(`   ${tool.name}: ${toolPath} ${msg}`);
			});
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.add.tags', (args) => {
			addTags(args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.remove.tags', (args) => {
			removeTags(args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.fill.struct', () => {
			runFillStruct(vscode.window.activeTextEditor);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.impl.cursor', () => {
			implCursor();
		})
	);
	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.godoctor.extract', () => {
			extractFunction();
		})
	);
	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.godoctor.var', () => {
			extractVariable();
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.test.cursor', (args) => {
			const goConfig = getGoConfig();
			testAtCursor(goConfig, 'test', args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.subtest.cursor', (args) => {
			const goConfig = getGoConfig();
			subTestAtCursor(goConfig, args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.debug.cursor', (args) => {
			if (vscode.debug.activeDebugSession) {
				vscode.window.showErrorMessage('Debug session has already been started.');
				return;
			}
			const goConfig = getGoConfig();
			testAtCursor(goConfig, 'debug', args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.benchmark.cursor', (args) => {
			const goConfig = getGoConfig();
			testAtCursor(goConfig, 'benchmark', args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.test.package', (args) => {
			const goConfig = getGoConfig();
			const isBenchmark = false;
			testCurrentPackage(goConfig, isBenchmark, args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.benchmark.package', (args) => {
			const goConfig = getGoConfig();
			const isBenchmark = true;
			testCurrentPackage(goConfig, isBenchmark, args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.test.file', (args) => {
			const goConfig = getGoConfig();
			const isBenchmark = false;
			testCurrentFile(goConfig, isBenchmark, args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.benchmark.file', (args) => {
			const goConfig = getGoConfig();
			const isBenchmark = true;
			testCurrentFile(goConfig, isBenchmark, args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.test.workspace', (args) => {
			const goConfig = getGoConfig();
			testWorkspace(goConfig, args);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.test.previous', () => {
			testPrevious();
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.test.coverage', () => {
			toggleCoverageCurrentPackage();
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.test.showOutput', () => {
			showTestOutput();
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.test.cancel', () => {
			cancelRunningTests();
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.import.add', (arg) => {
			return addImport(arg);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.add.package.workspace', () => {
			addImportToWorkspace();
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.tools.install', async (args) => {
			if (Array.isArray(args) && args.length) {
				const goVersion = await getGoVersion();
				await installTools(args, goVersion);
				return;
			}
			installAllTools();
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.browse.packages', () => {
			browsePackages();
		})
	);

	ctx.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
>>>>>>> origin/dev.go2go
			if (!e.affectsConfiguration('go')) {
				return;
			}
			const updatedGoConfig = getGoConfig();

<<<<<<< HEAD
			if (e.affectsConfiguration('go.goroot')) {
				const configGOROOT = updatedGoConfig['goroot'];
				if (configGOROOT) {
					await setGOROOTEnvVar(configGOROOT);
				}
			}
			if (
				e.affectsConfiguration('go.goroot') ||
				e.affectsConfiguration('go.alternateTools') ||
				e.affectsConfiguration('go.gopath') ||
				e.affectsConfiguration('go.toolsEnvVars') ||
				e.affectsConfiguration('go.testEnvFile')
			) {
				updateGoVarsFromConfig(goCtx);
			}
			if (e.affectsConfiguration('go.logging')) {
				setLogConfig(updatedGoConfig['logging']);
=======
			if (e.affectsConfiguration('go.goroot') ||
				e.affectsConfiguration('go.alternateTools') ||
				e.affectsConfiguration('go.gopath') ||
				e.affectsConfiguration('go.toolsEnvVars') ||
				e.affectsConfiguration('go.testEnvFile')) {
				updateGoVarsFromConfig();
>>>>>>> origin/dev.go2go
			}
			// If there was a change in "toolsGopath" setting, then clear cache for go tools
			if (getToolsGopath() !== getToolsGopath(false)) {
				clearCacheForTools();
			}

			if (e.affectsConfiguration('go.formatTool')) {
				checkToolExists(getFormatTool(updatedGoConfig));
			}
			if (e.affectsConfiguration('go.lintTool')) {
				checkToolExists(updatedGoConfig['lintTool']);
			}
			if (e.affectsConfiguration('go.docsTool')) {
				checkToolExists(updatedGoConfig['docsTool']);
			}
			if (e.affectsConfiguration('go.coverageDecorator')) {
				updateCodeCoverageDecorators(updatedGoConfig['coverageDecorator']);
			}
			if (e.affectsConfiguration('go.toolsEnvVars')) {
				const env = toolExecutionEnvironment();
				if (GO111MODULE !== env['GO111MODULE']) {
					const reloadMsg =
						'Reload VS Code window so that the Go tools can respect the change to GO111MODULE';
					vscode.window.showInformationMessage(reloadMsg, 'Reload').then((selected) => {
						if (selected === 'Reload') {
							vscode.commands.executeCommand('workbench.action.reloadWindow');
						}
					});
				}
			}
			if (e.affectsConfiguration('go.lintTool')) {
				const lintTool = lintDiagnosticCollectionName(updatedGoConfig['lintTool']);
				if (goCtx.lintDiagnosticCollection && goCtx.lintDiagnosticCollection.name !== lintTool) {
					goCtx.lintDiagnosticCollection.dispose();
					goCtx.lintDiagnosticCollection = vscode.languages.createDiagnosticCollection(lintTool);
					ctx.subscriptions.push(goCtx.lintDiagnosticCollection);
					// TODO: actively maintain our own disposables instead of keeping pushing to ctx.subscription.
				}
			}
			if (e.affectsConfiguration('go.testExplorer.enable')) {
				const msg =
					'Go test explorer has been enabled or disabled. For this change to take effect, the window must be reloaded.';
				vscode.window.showInformationMessage(msg, 'Reload').then((selected) => {
					if (selected === 'Reload') {
						vscode.commands.executeCommand('workbench.action.reloadWindow');
					}
<<<<<<< HEAD
=======
					if (!fileExists(coverProfilePath)) {
						vscode.window.showErrorMessage(`Cannot find the file ${coverProfilePath}`);
						return;
					}
					if (coverProfilePath !== lastCoverProfilePath) {
						updateWorkspaceState(lastCoverProfilePathKey, coverProfilePath);
					}
					applyCodeCoverageToAllEditors(
						coverProfilePath
					);
>>>>>>> origin/dev.go2go
				});
			}
		})
	);
<<<<<<< HEAD
=======

	// Go Enviornment switching commands
	ctx.subscriptions.push(
		vscode.commands.registerCommand('go.environment.choose', () => {
			chooseGoEnvironment();
		})
	);

	vscode.languages.setLanguageConfiguration(GO_MODE.language, {
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
	});
}

export function deactivate() {
	return Promise.all([cancelRunningTests(), Promise.resolve(cleanupTempDir())]);
}

function runBuilds(document: vscode.TextDocument, goConfig: vscode.WorkspaceConfiguration) {
	if (document.languageId !== 'go') {
		return;
	}

	buildDiagnosticCollection.clear();
	lintDiagnosticCollection.clear();
	vetDiagnosticCollection.clear();
	check(document.uri, goConfig)
		.then((results) => {
			results.forEach((result) => {
				handleDiagnosticErrors(document, result.errors, result.diagnosticCollection);
			});
		})
		.catch((err) => {
			vscode.window.showInformationMessage('Error: ' + err);
		});
>>>>>>> origin/dev.go2go
}

function addOnSaveTextDocumentListeners(ctx: vscode.ExtensionContext) {
	vscode.workspace.onDidSaveTextDocument(removeCodeCoverageOnFileSave, null, ctx.subscriptions);
	vscode.workspace.onDidSaveTextDocument(
		(document) => {
			if (document.languageId !== 'go') {
				return;
			}
			const session = vscode.debug.activeDebugSession;
			if (session && session.type === 'go') {
				const neverAgain = { title: "Don't Show Again" };
				const ignoreActiveDebugWarningKey = 'ignoreActiveDebugWarningKey';
				const ignoreActiveDebugWarning = getFromGlobalState(ignoreActiveDebugWarningKey);
				if (!ignoreActiveDebugWarning) {
					vscode.window
						.showWarningMessage(
							'A debug session is currently active. Changes to your Go files may result in unexpected behaviour.',
							neverAgain
						)
						.then((result) => {
							if (result === neverAgain) {
								updateGlobalState(ignoreActiveDebugWarningKey, true);
							}
						});
				}
			}
			if (vscode.window.visibleTextEditors.some((e) => e.document.fileName === document.fileName)) {
				vscode.commands.executeCommand('go.builds.run', document, getGoConfig(document.uri));
			}
		},
		null,
		ctx.subscriptions
	);
}

function addOnChangeTextDocumentListeners(ctx: vscode.ExtensionContext) {
	vscode.workspace.onDidChangeTextDocument(trackCodeCoverageRemovalOnFileChange, null, ctx.subscriptions);
	vscode.workspace.onDidChangeTextDocument(removeTestStatus, null, ctx.subscriptions);
	vscode.workspace.onDidChangeTextDocument(notifyIfGeneratedFile, ctx, ctx.subscriptions);
}

function addOnChangeActiveTextEditorListeners(ctx: vscode.ExtensionContext) {
	[updateGoStatusBar, applyCodeCoverage].forEach((listener) => {
		// Call the listeners on initilization for current active text editor
		if (vscode.window.activeTextEditor) {
			listener(vscode.window.activeTextEditor);
		}
		vscode.window.onDidChangeActiveTextEditor(listener, null, ctx.subscriptions);
	});
}

function checkToolExists(tool: string) {
	if (tool === getBinPath(tool)) {
		promptForMissingTool(tool);
	}
}

<<<<<<< HEAD
function lintDiagnosticCollectionName(lintToolName: string) {
	if (!lintToolName || lintToolName === 'golint') {
		return 'go-lint';
	}
	return `go-${lintToolName}`;
}

async function showDeprecationWarning() {
	const cfg = getGoConfig();
	const disableLanguageServer = cfg['useLanguageServer'];
	if (disableLanguageServer === false) {
		const promptKey = 'promptedLegacyLanguageServerDeprecation';
		const prompted = getFromGlobalState(promptKey, false);
		if (!prompted) {
			const msg =
				'When [go.useLanguageServer](command:workbench.action.openSettings?%5B%22go.useLanguageServer%22%5D) is false, IntelliSense, code navigation, and refactoring features for Go will stop working. Linting, debugging and testing other than debug/test code lenses will continue to work. Please see [Issue 2799](https://go.dev/s/vscode-issue/2799).';
			const selected = await vscode.window.showInformationMessage(msg, 'Open settings', "Don't show again");
			switch (selected) {
				case 'Open settings':
					vscode.commands.executeCommand('workbench.action.openSettings', 'go.useLanguageServer');
					break;
				case "Don't show again":
					updateGlobalState(promptKey, true);
			}
		}
=======
class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
	public createDebugAdapterDescriptor(session: vscode.DebugSession
	): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		return new vscode.DebugAdapterInlineImplementation(new GoDlvDapDebugSession());
>>>>>>> origin/dev.go2go
	}
}
