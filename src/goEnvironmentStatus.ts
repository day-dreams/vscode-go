<<<<<<< HEAD
/* eslint-disable no-prototype-builtins */
/* eslint-disable prefer-const */
=======
>>>>>>> origin/dev.go2go
/*---------------------------------------------------------
 * Copyright 2020 The Go Authors. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import cp = require('child_process');
import fs = require('fs');
<<<<<<< HEAD
import moment = require('moment');
import os = require('os');
import path = require('path');
import { promisify } from 'util';
import { getGoConfig, extensionInfo } from './config';
import { toolInstallationEnvironment } from './goEnv';
import { logVerbose } from './goLogging';
import { addGoStatus, goEnvStatusbarItem, outputChannel, removeGoStatus } from './goStatus';
import { getFromGlobalState, getFromWorkspaceState, updateGlobalState, updateWorkspaceState } from './stateUtils';
import { getBinPath, getCheckForToolsUpdatesConfig, getGoVersion, GoVersion } from './util';
import {
	correctBinname,
	executableFileExists,
	fixDriveCasingInWindows,
	getBinPathFromEnvVar,
	getCurrentGoRoot,
	dirExists
} from './utils/pathUtils';
import vscode = require('vscode');
import WebRequest = require('web-request');
import { installTool } from './goInstallTools';
import { CommandFactory } from './commands';

export class GoEnvironmentOption implements vscode.QuickPickItem {
	readonly description: string;
	constructor(readonly binpath: string, readonly label: string, readonly available = true) {
		this.description = available ? binpath : `download ${binpath}`;
	}
}

export let terminalCreationListener: vscode.Disposable | undefined;

let environmentVariableCollection: vscode.EnvironmentVariableCollection;
export function setEnvironmentVariableCollection(env: vscode.EnvironmentVariableCollection) {
	environmentVariableCollection = env;
}

// QuickPickItem names for chooseGoEnvironment menu.
const CLEAR_SELECTION = '$(clear-all) Clear selection';
const CHOOSE_FROM_FILE_BROWSER = '$(folder) Choose from file browser';

function canChooseGoEnvironment() {
	// if there is no workspace, show GOROOT with message
	if (!vscode.workspace.name) {
		return { ok: false, reason: 'Switching Go version is not yet supported in single-file mode.' };
	}

	if (getGoConfig().get('goroot')) {
		return { ok: false, reason: 'Switching Go version when "go.goroot" is set is unsupported.' };
	}

	if (process.env['GOROOT']) {
		return { ok: false, reason: 'Switching Go version when process.env["GOROOT"] is set is unsupported.' };
	}

	return { ok: true };
}
/**
 * Present a command palette menu to the user to select their go binary
 */
export const chooseGoEnvironment: CommandFactory = () => async () => {
	if (!goEnvStatusbarItem) {
		return;
	}
	const { ok, reason } = canChooseGoEnvironment();
	if (!ok) {
		vscode.window.showInformationMessage(`GOROOT: ${getCurrentGoRoot()}. ${reason}`);
		return;
	}

	// fetch default go and uninstalled go versions
	let defaultOption: GoEnvironmentOption | undefined;
=======
import os = require('os');
import path = require('path');
import { promisify } from 'util';
import vscode = require('vscode');
import WebRequest = require('web-request');
import { toolInstallationEnvironment } from './goEnv';
import { getCurrentGoRoot, pathExists } from './goPath';
import { outputChannel } from './goStatus';
import { getBinPath, getGoConfig, getGoVersion, timeout } from './util';

export class GoEnvironmentOption {
	public static fromQuickPickItem({ description, label }: vscode.QuickPickItem): GoEnvironmentOption {
		return new GoEnvironmentOption(description, label);
	}

	constructor(public binpath: string, public label: string) {}

	public toQuickPickItem(): vscode.QuickPickItem {
		return {
			label: this.label,
			description: this.binpath,
		};
	}
}

// statusbar item for switching the Go environment
let goEnvStatusbarItem: vscode.StatusBarItem;
let terminalCreationListener: vscode.Disposable;

/**
 * Initialize the status bar item with current Go binary
 */
export async function initGoStatusBar() {
	if (!goEnvStatusbarItem) {
		goEnvStatusbarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
	}
	// set Go version and command
	const version = await getGoVersion();
	const goOption = new GoEnvironmentOption(version.binaryPath, formatGoVersion(version.format()));

	// ensure terminals use the correct Go version
	if (!terminalCreationListener) {
		updateIntegratedTerminal(vscode.window.activeTerminal);
		terminalCreationListener = vscode.window.onDidOpenTerminal(updateIntegratedTerminal);
	}

	hideGoStatusBar();
	goEnvStatusbarItem.text = goOption.label;
	goEnvStatusbarItem.command = 'go.environment.choose';
	showGoStatusBar();
}

/**
 * disable the Go environment status bar item
 */
export function disposeGoStatusBar() {
	if (!!goEnvStatusbarItem) {
		goEnvStatusbarItem.dispose();
	}
	if (!!terminalCreationListener) {
		terminalCreationListener.dispose();
	}
}

/**
 * Show the Go Environment statusbar item on the statusbar
 */
export function showGoStatusBar() {
	if (!!goEnvStatusbarItem) {
		goEnvStatusbarItem.show();
	}
}

/**
 * Hide the Go Environment statusbar item from the statusbar
 */
export function hideGoStatusBar() {
	if (!!goEnvStatusbarItem) {
		goEnvStatusbarItem.hide();
	}
}

/**
 * Present a command palette menu to the user to select their go binary
 */
export async function chooseGoEnvironment() {
	if (!goEnvStatusbarItem) {
		return;
	}

	// fetch default go and uninstalled go versions
	let defaultOption: GoEnvironmentOption;
>>>>>>> origin/dev.go2go
	let uninstalledOptions: GoEnvironmentOption[];
	let goSDKOptions: GoEnvironmentOption[];
	try {
		[defaultOption, uninstalledOptions, goSDKOptions] = await Promise.all([
			getDefaultGoOption(),
			fetchDownloadableGoVersions(),
			getSDKGoOptions()
		]);
	} catch (e) {
<<<<<<< HEAD
		vscode.window.showErrorMessage((e as Error).message);
=======
		vscode.window.showErrorMessage(e.message);
>>>>>>> origin/dev.go2go
		return;
	}

	// create quick pick items
<<<<<<< HEAD
	const defaultQuickPick = defaultOption ? [defaultOption] : [];

	// dedup options by eliminating duplicate paths (description)
	const clearOption: vscode.QuickPickItem = { label: CLEAR_SELECTION };
	const filePickerOption: vscode.QuickPickItem = {
		label: CHOOSE_FROM_FILE_BROWSER,
		description: 'Select the go binary to use'
	};
	// TODO(hyangah): Add separators after clearOption if github.com/microsoft/vscode#74967 is resolved.
	const options = [filePickerOption, clearOption, ...defaultQuickPick, ...goSDKOptions, ...uninstalledOptions].reduce(
		(opts, nextOption) => {
			if (opts.find((op) => op.description === nextOption.description || op.label === nextOption.label)) {
				return opts;
			}
			return [...opts, nextOption];
		},
		[] as vscode.QuickPickItem[]
	);
=======
	const uninstalledQuickPicks = uninstalledOptions.map((op) => op.toQuickPickItem());
	const defaultQuickPick = defaultOption.toQuickPickItem();
	const goSDKQuickPicks = goSDKOptions.map((op) => op.toQuickPickItem());

	// dedup options by eliminating duplicate paths (description)
	const options = [defaultQuickPick, ...goSDKQuickPicks, ...uninstalledQuickPicks].reduce((opts, nextOption) => {
		if (opts.find((op) => op.description === nextOption.description || op.label === nextOption.label)) {
			return opts;
		}
		return [...opts, nextOption];
	}, [] as vscode.QuickPickItem[]);
>>>>>>> origin/dev.go2go

	// get user's selection, return if none was made
	const selection = await vscode.window.showQuickPick<vscode.QuickPickItem>(options);
	if (!selection) {
		return;
	}

	// update currently selected go
	try {
<<<<<<< HEAD
		await setSelectedGo(selection);
	} catch (e) {
		vscode.window.showErrorMessage((e as Error).message);
	}
};
=======
		await setSelectedGo(GoEnvironmentOption.fromQuickPickItem(selection), vscode.ConfigurationTarget.Workspace);
		vscode.window.showInformationMessage(`Switched to ${selection.label}`);
	} catch (e) {
		vscode.window.showErrorMessage(e.message);
	}
}
>>>>>>> origin/dev.go2go

/**
 * update the selected go path and label in the workspace state
 */
<<<<<<< HEAD
export async function setSelectedGo(goOption: vscode.QuickPickItem, promptReload = true): Promise<boolean> {
	if (!goOption) {
		return false;
	}

	// if the selected go version is not installed, install it
	if (goOption instanceof GoEnvironmentOption) {
		const o = goOption.available ? (goOption as GoEnvironmentOption) : await downloadGo(goOption);
		// check that the given binary is not already at the beginning of the PATH
		const go = await getGoVersion();
		if (!!go && (go.binaryPath === o.binpath || 'Go ' + go.format() === o.label)) {
			return false;
		}
		await updateWorkspaceState('selectedGo', o);
	} else if (goOption.label === CLEAR_SELECTION) {
		if (!getSelectedGo()) {
			return false; // do nothing.
		}
		await updateWorkspaceState('selectedGo', undefined);
	} else if (goOption.label === CHOOSE_FROM_FILE_BROWSER) {
		const currentGOROOT = getCurrentGoRoot();
		const defaultUri = currentGOROOT ? vscode.Uri.file(path.join(currentGOROOT, 'bin')) : undefined;

		const newGoUris = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			defaultUri
		});
		if (!newGoUris || newGoUris.length !== 1) {
			return false;
		}
		const newGoBin = fixDriveCasingInWindows(newGoUris[0].fsPath);
		const oldGoBin = fixDriveCasingInWindows(path.join(defaultUri?.fsPath ?? '', correctBinname('go')));

		if (newGoBin === oldGoBin) {
			return false;
		}
		if (!executableFileExists(newGoBin)) {
			vscode.window.showErrorMessage(`${newGoBin} is not an executable`);
			return false;
		}
		let newGo: GoVersion | undefined;
		try {
			newGo = await getGoVersion(newGoBin);
			await updateWorkspaceState('selectedGo', new GoEnvironmentOption(newGo.binaryPath, formatGoVersion(newGo)));
		} catch (e) {
			if (!newGo || !newGo.isValid()) {
				vscode.window.showErrorMessage(`failed to get "${newGoBin} version", invalid Go binary:\n${e}`);
				return false;
			}
		}
	}
	// prompt the user to reload the window.
	// promptReload defaults to true and should only be false for tests.
	if (promptReload) {
		const choice = await vscode.window.showWarningMessage(
			'Please reload the window to finish applying Go version changes.',
			{
				modal: true
			},
			'Reload Window'
		);
		if (choice === 'Reload Window') {
			await vscode.commands.executeCommand('workbench.action.reloadWindow');
		}
	}
	goEnvStatusbarItem.text = 'Go: reload required';
	goEnvStatusbarItem.command = 'workbench.action.reloadWindow';

	return true;
}

// downloadGo downloads the specified go version available in dl.golang.org.
async function downloadGo(goOption: GoEnvironmentOption): Promise<GoEnvironmentOption> {
	if (goOption.available) {
		return Promise.resolve(goOption);
	}
	const execFile = promisify(cp.execFile);
	const newExecutableName = goOption.binpath.split('/').splice(-1)[0];

	return await vscode.window.withProgress(
		{
			title: `Downloading ${goOption.label}`,
			location: vscode.ProgressLocation.Notification
		},
		async () => {
			outputChannel.clear();
			outputChannel.show();
			outputChannel.appendLine(`go install ${goOption.binpath}@latest`);
			const result = await installTool({
				name: newExecutableName,
				importPath: goOption.binpath,
				modulePath: goOption.binpath,
				description: newExecutableName,
				isImportant: false
			});
			if (result) {
				outputChannel.appendLine(`Error installing ${goOption.binpath}: ${result}`);
				throw new Error('Could not install ${goOption.binpath}');
			}
			// run `goX.X download`
			const goXExecutable = getBinPath(newExecutableName);
			outputChannel.appendLine(`${goXExecutable} download`);
			try {
				await execFile(goXExecutable, ['download']);
=======
export async function setSelectedGo(
	selectedGo: GoEnvironmentOption, scope: vscode.ConfigurationTarget, promptReload = true
) {
	const execFile = promisify(cp.execFile);

	const goConfig = getGoConfig();
	const alternateTools: any = goConfig.get('alternateTools') || {};
	// if the selected go version is not installed, install it
	if (selectedGo.binpath.startsWith('go get')) {
		// start a loading indicator
		await vscode.window.withProgress({
			title: `Downloading ${selectedGo.label}`,
			location: vscode.ProgressLocation.Notification,
		}, async () => {
			outputChannel.show();
			outputChannel.clear();

			outputChannel.appendLine('Finding Go executable for downloading');
			const goExecutable = getBinPath('go');
			if (!goExecutable) {
				outputChannel.appendLine('Could not find Go executable.');
				throw new Error('Could not find Go tool.');
			}

			// use the current go executable to download the new version
			const env = toolInstallationEnvironment();
			const [, ...args] = selectedGo.binpath.split(' ');
			outputChannel.appendLine(`Running ${goExecutable} ${args.join(' ')}`);
			try {
				await execFile(goExecutable, args, { env });
			} catch (getErr) {
				outputChannel.appendLine(`Error finding Go: ${getErr}`);
				throw new Error('Could not find Go version.');
			}

			// run `goX.X download`
			const newExecutableName = args[1].split('/')[2];
			const goXExecutable = getBinPath(newExecutableName);
			outputChannel.appendLine(`Running: ${goXExecutable} download`);
			try {
				await execFile(goXExecutable, ['download'], { env });
>>>>>>> origin/dev.go2go
			} catch (downloadErr) {
				outputChannel.appendLine(`Error finishing installation: ${downloadErr}`);
				throw new Error('Could not download Go version.');
			}

<<<<<<< HEAD
			outputChannel.appendLine(`Checking newly downloaded ${goOption.label} SDK`);

			let sdkPath = '';
			try {
				const { stdout } = await execFile(goXExecutable, ['env', 'GOROOT'], {
					env: toolInstallationEnvironment()
				});
				if (stdout) {
					sdkPath = stdout.trim();
				}
			} catch (downloadErr) {
				outputChannel.appendLine(`Error finishing installation: ${downloadErr}`);
				throw new Error('Could not download Go version.');
			}
			if (!sdkPath || !(await dirExists(sdkPath))) {
=======
			outputChannel.appendLine('Finding newly downloaded Go');
			const sdkPath = path.join(process.env.HOME, 'sdk');
			if (!await pathExists(sdkPath)) {
>>>>>>> origin/dev.go2go
				outputChannel.appendLine(`SDK path does not exist: ${sdkPath}`);
				throw new Error(`SDK path does not exist: ${sdkPath}`);
			}

<<<<<<< HEAD
			outputChannel.appendLine(`${goOption.label} is available in ${sdkPath}`);

			const binpath = path.join(sdkPath, 'bin', correctBinname('go'));
			const newOption = new GoEnvironmentOption(binpath, goOption.label);
			outputChannel.appendLine('Success!');
			return newOption;
		}
	);
}

// PATH value cached before addGoRuntimeBaseToPath modified.
let defaultPathEnv = '';

function pathEnvVarName(): string | undefined {
	if (process.env.hasOwnProperty('PATH')) {
		return 'PATH';
	} else if (process.platform === 'win32' && process.env.hasOwnProperty('Path')) {
		return 'Path';
	} else {
		return;
	}
}

// addGoRuntimeBaseToPATH adds the given path to the front of the PATH environment variable.
// It removes duplicates.
// TODO: can we avoid changing PATH but utilize toolExecutionEnv?
export function addGoRuntimeBaseToPATH(newGoRuntimeBase: string) {
	if (!newGoRuntimeBase) {
		return;
	}
	const goCfg = getGoConfig();
	if (!goCfg.get('terminal.activateEnvironment')) {
		return;
	}
	const pathEnvVar = pathEnvVarName();
	if (!pathEnvVar) {
		logVerbose("couldn't find PATH property in process.env");
		return;
	}

	if (!defaultPathEnv) {
		// cache the default value
		defaultPathEnv = <string>process.env[pathEnvVar];
	}

	logVerbose(`addGoRuntimeBase(${newGoRuntimeBase}) when PATH=${defaultPathEnv}`);

	// calling this multiple times will override the previous value.
	// environmentVariableCollection.clear();
	if (process.platform !== 'darwin') {
		environmentVariableCollection?.prepend(pathEnvVar, newGoRuntimeBase + path.delimiter);
	} else {
		// When '-l' or '--login' flags are set, the terminal will invoke a login
		// shell again and the paths from the user's login shell will be prepended
		// again in front of the path mutated by environmentVariableCollection API.
		// That causes the mutated path to be ignored which we don't want.
		// So, let's not use the API if those flags are set, but go with the old way
		// -- i.e. send the export shell command.
		// See the open issue and the discussion here:
		// https://github.com/microsoft/vscode/issues/99878#issuecomment-642808852
		const terminalShellArgs = <string[]>(
			(vscode.workspace.getConfiguration('terminal.integrated.shellArgs').get('osx') || [])
		);
		if (terminalShellArgs.includes('-l') || terminalShellArgs.includes('--login')) {
			for (const term of vscode.window.terminals) {
				updateIntegratedTerminal(term);
			}
			if (terminalCreationListener) {
				terminalCreationListener.dispose();
			}
			terminalCreationListener = vscode.window.onDidOpenTerminal(updateIntegratedTerminal);
		} else {
			environmentVariableCollection?.prepend(pathEnvVar, newGoRuntimeBase + path.delimiter);
		}
	}

	let pathVars = defaultPathEnv.split(path.delimiter);
	pathVars = pathVars.filter((p) => p !== newGoRuntimeBase);
	pathVars.unshift(newGoRuntimeBase);
	process.env[pathEnvVar] = pathVars.join(path.delimiter);
}

// Clear terminal PATH environment modification previously installed
// using addGoRuntimeBaseToPATH.
// In particular, changes to vscode.EnvironmentVariableCollection persist across
// vscode sessions, so when we decide not to mutate PATH, we need to clear
// the preexisting changes.
export function clearGoRuntimeBaseFromPATH() {
	if (terminalCreationListener) {
		const l = terminalCreationListener;
		terminalCreationListener = undefined;
		l.dispose();
	}
	const pathEnvVar = pathEnvVarName();
	if (!pathEnvVar) {
		logVerbose("couldn't find PATH property in process.env");
		return;
	}
	environmentVariableCollection?.delete(pathEnvVar);
}

function isTerminalOptions(
	opts: vscode.TerminalOptions | vscode.ExtensionTerminalOptions
): opts is vscode.TerminalOptions {
	return 'shellPath' in opts;
=======
			const readdir = promisify(fs.readdir);
			const subdirs = await readdir(sdkPath);
			const dir = subdirs.find((subdir) => subdir === newExecutableName);
			if (!dir) {
				outputChannel.appendLine('Could not find newly downloaded Go');
				throw new Error('Could not install Go version.');
			}

			const binpath = path.join(sdkPath, dir, 'bin', 'go');
			const newAlternateTools = {
				...alternateTools,
				go: binpath,
			};
			await goConfig.update('alternateTools', newAlternateTools, scope);
			goEnvStatusbarItem.text = selectedGo.label;

			outputChannel.appendLine('Updating integrated terminals');
			vscode.window.terminals.forEach(updateIntegratedTerminal);
			outputChannel.appendLine('Success!');
		});
	} else {
		const newAlternateTools = {
			...alternateTools,
			go: selectedGo.binpath,
		};
		await goConfig.update('alternateTools', newAlternateTools, scope);
		goEnvStatusbarItem.text = selectedGo.label;
	}
	// prompt the user to reload the window
	// promptReload defaults to true and should only be false for tests
	if (promptReload) {
		const choice = await vscode.window.showInformationMessage('Please reload the window to finish applying changes.', 'Reload Window');
		if (choice === 'Reload Window') {
			await vscode.commands.executeCommand('workbench.action.reloadWindow');
		}
	}
>>>>>>> origin/dev.go2go
}

/**
 * update the PATH variable in the given terminal to default to the currently selected Go
 */
<<<<<<< HEAD
export async function updateIntegratedTerminal(terminal: vscode.Terminal): Promise<void> {
	if (
		!terminal ||
		// don't interfere if this terminal was created to run a Go task (goTaskProvider.ts).
		// Go task uses ProcessExecution which results in the terminal having `go` or `go.exe`
		// as its shellPath.
		(isTerminalOptions(terminal.creationOptions) &&
			path.basename(terminal.creationOptions.shellPath || '') === correctBinname('go'))
	) {
		return;
	}
	const gorootBin = path.join(getCurrentGoRoot(), 'bin');
	const defaultGoRuntime = getBinPathFromEnvVar('go', defaultPathEnv, false);
	if (defaultGoRuntime && gorootBin === path.dirname(defaultGoRuntime)) {
		return;
	}

	// append the goroot to the beginning of the PATH so it takes precedence
	// TODO: add support for more terminal names
	if (vscode.env.shell.search(/(powershell|pwsh)$/i) !== -1) {
		terminal.sendText(`$env:Path="${gorootBin};$env:Path"`, true);
		terminal.sendText('clear');
	} else if (vscode.env.shell.search(/fish$/i) !== -1) {
		terminal.sendText(`set -gx PATH ${gorootBin} $PATH`);
		terminal.sendText('clear');
	} else if (vscode.env.shell.search(/\/(bash|sh|zsh|ksh)$/i) !== -1) {
		terminal.sendText(`export PATH=${gorootBin}:$PATH`, true);
=======
export async function updateIntegratedTerminal(terminal: vscode.Terminal) {
	if (!terminal) { return; }
	const goroot = path.join(getCurrentGoRoot(), 'bin');
	const isWindows = terminal.name.toLowerCase() === 'powershell' || terminal.name.toLowerCase() === 'cmd';

	// append the goroot to the beginning of the PATH so it takes precedence
	// TODO: add support for more terminal names
	// this assumes all non-windows shells are bash-like.
	if (isWindows) {
		terminal.sendText(`set PATH=${goroot};%Path%`, true);
		terminal.sendText('cls');
	} else {
		terminal.sendText(`export PATH=${goroot}:$PATH`, true);
>>>>>>> origin/dev.go2go
		terminal.sendText('clear');
	}
}

/**
 * retreive the current selected Go from the workspace state
 */
<<<<<<< HEAD
export function getSelectedGo(): GoEnvironmentOption {
	return getFromWorkspaceState('selectedGo');
=======
export async function getSelectedGo(): Promise<GoEnvironmentOption> {
	const goVersion = await getGoVersion();
	return new GoEnvironmentOption(goVersion.binaryPath, formatGoVersion(goVersion.format()));
>>>>>>> origin/dev.go2go
}

/**
 * return reference to the statusbar item
 */
export function getGoEnvironmentStatusbarItem(): vscode.StatusBarItem {
	return goEnvStatusbarItem;
}

<<<<<<< HEAD
export function formatGoVersion(version?: GoVersion): string {
	if (!version || !version.isValid()) {
		return 'Go (unknown)';
	}
	const versionStr = version.format(true);
	const versionWords = versionStr.split(' ');
	if (versionWords.length > 1 && versionWords[0] === 'devel') {
		// go devel +hash or go devel go1.17-hash
		return versionWords[1].startsWith('go') ? `Go ${versionWords[1].slice(2)}` : `Go ${versionWords[1]}`;
	} else {
=======
export function formatGoVersion(version: string): string {
	const versionWords = version.split(' ');
	if (versionWords[0] === 'devel') {
		// Go devel +hash
		return `Go ${versionWords[0]} ${versionWords[4]}`;
	} else if (versionWords.length > 0) {
		// some other version format
		return `Go ${version.substr(0, 8)}`;
	} else {
		// default semantic version format
>>>>>>> origin/dev.go2go
		return `Go ${versionWords[0]}`;
	}
}

async function getSDKGoOptions(): Promise<GoEnvironmentOption[]> {
	// get list of Go versions
	const sdkPath = path.join(os.homedir(), 'sdk');

<<<<<<< HEAD
	if (!(await dirExists(sdkPath))) {
=======
	if (!await pathExists(sdkPath)) {
>>>>>>> origin/dev.go2go
		return [];
	}
	const readdir = promisify(fs.readdir);
	const subdirs = await readdir(sdkPath);
	// the dir happens to be the version, which will be used as the label
	// the path is assembled and used as the description
<<<<<<< HEAD
	return subdirs.map(
		(dir: string) =>
			new GoEnvironmentOption(path.join(sdkPath, dir, 'bin', correctBinname('go')), dir.replace('go', 'Go '))
	);
}

export async function getDefaultGoOption(): Promise<GoEnvironmentOption | undefined> {
	// make goroot default to go.goroot
	const goroot = getCurrentGoRoot();
	if (!goroot) {
		return undefined;
=======
	return subdirs.map((dir: string) =>
		new GoEnvironmentOption(
			path.join(sdkPath, dir, 'bin', 'go'),
			dir.replace('go', 'Go '),
		)
	);
}

export async function getDefaultGoOption(): Promise<GoEnvironmentOption> {
	// make goroot default to go.goroot
	const goroot = getCurrentGoRoot();
	if (!goroot) {
		throw new Error('No Go command could be found.');
>>>>>>> origin/dev.go2go
	}

	// set Go version and command
	const version = await getGoVersion();
<<<<<<< HEAD
	return new GoEnvironmentOption(path.join(goroot, 'bin', correctBinname('go')), formatGoVersion(version));
=======
	return new GoEnvironmentOption(
		path.join(goroot, 'bin', 'go'),
		formatGoVersion(version.format()),
	);
>>>>>>> origin/dev.go2go
}

/**
 * make a web request to get versions of Go
 */
interface GoVersionWebResult {
	version: string;
	stable: boolean;
<<<<<<< HEAD
}

async function fetchDownloadableGoVersions(): Promise<GoEnvironmentOption[]> {
	// fetch information about what Go versions are available to install
	let webResults;
	try {
		webResults = await WebRequest.json<GoVersionWebResult[]>('https://go.dev/dl/?mode=json');
	} catch (error) {
		return [];
	}

	if (!webResults) {
		return [];
	}
	// turn the web result into GoEnvironmentOption model
	return webResults.reduce((opts, result: GoVersionWebResult) => {
		// TODO: allow downloading from different sites
		const dlPath = `golang.org/dl/${result.version}`;
		const label = result.version.replace('go', 'Go ');
		return [...opts, new GoEnvironmentOption(dlPath, label, false)];
	}, [] as GoEnvironmentOption[]);
}

export const latestGoVersionKey = 'latestGoVersions';
const oneday = 60 * 60 * 24 * 1000; // 24 hours in milliseconds

export async function getLatestGoVersions(): Promise<GoEnvironmentOption[]> {
	const timeout = oneday;
	const now = moment.now();

	let results: GoEnvironmentOption[];

	// Check if we can use cached results
	const cachedResults = getFromGlobalState(latestGoVersionKey);
	if (cachedResults && now - cachedResults.timestamp < timeout) {
		results = cachedResults.goVersions;
	} else {
		// fetch the latest supported Go versions
		try {
			// fetch the latest Go versions and cache the results
			results = await fetchDownloadableGoVersions();
			await updateGlobalState(latestGoVersionKey, {
				timestamp: now,
				goVersions: results
			});
		} catch (e) {
			// hardcode the latest versions of Go in case golang.dl is unavailable
			// TODO(hyangah): consider to remove these hardcoded versions and instead
			// show error notification if necessary.
			results = [
				new GoEnvironmentOption('golang.org/dl/go1.17.6', 'Go 1.17.6', false),
				new GoEnvironmentOption('golang.org/dl/go1.16.13', 'Go 1.16.13', false)
			];
		}
	}

	return results;
}

const STATUS_BAR_ITEM_NAME = 'Go Notification';
const dismissedGoVersionUpdatesKey = 'dismissedGoVersionUpdates';

export async function offerToInstallLatestGoVersion() {
	if (extensionInfo.isInCloudIDE) {
		return;
	}
	const goConfig = getGoConfig();
	const checkForUpdate = getCheckForToolsUpdatesConfig(goConfig);
	if (checkForUpdate === 'off' || checkForUpdate === 'local') {
		// 'proxy' or misconfiguration..
		return;
	}

	let options = await getLatestGoVersions();

	// filter out Go versions the user has already dismissed
	let dismissedOptions: GoEnvironmentOption[];
	dismissedOptions = await getFromGlobalState(dismissedGoVersionUpdatesKey);
	if (dismissedOptions) {
		options = options.filter((version) => !dismissedOptions.find((x) => x.label === version.label));
	}

	// compare to current go version.
	const currentVersion = await getGoVersion();
	if (currentVersion) {
		options = options.filter((version) => currentVersion.lt(version.label));
	}

	// notify user that there is a newer version of Go available
	if (options.length > 0) {
		addGoStatus(
			STATUS_BAR_ITEM_NAME,
			'Go Update Available',
			'go.promptforgoinstall',
			'A newer version of Go is available'
		);
		vscode.commands.registerCommand('go.promptforgoinstall', () => {
			const download = {
				title: 'Download',
				async command() {
					await vscode.env.openExternal(vscode.Uri.parse('https://go.dev/dl/'));
				}
			};

			const neverAgain = {
				title: "Don't Show Again",
				async command() {
					// mark these versions as seen
					dismissedOptions = await getFromGlobalState(dismissedGoVersionUpdatesKey);
					if (!dismissedOptions) {
						dismissedOptions = [];
					}
					options.forEach((version) => {
						dismissedOptions.push(version);
					});
					await updateGlobalState(dismissedGoVersionUpdatesKey, dismissedOptions);
				}
			};

			let versionsText: string;
			if (options.length > 1) {
				versionsText = `${options
					.map((x) => x.label)
					.reduce((prev, next) => {
						return prev + ' and ' + next;
					})} are available`;
			} else {
				versionsText = `${options[0].label} is available`;
			}

			vscode.window
				.showInformationMessage(
					`${versionsText}. You are currently using ${formatGoVersion(currentVersion)}.`,
					download,
					neverAgain
				)
				.then((selection) => {
					// TODO: should we removeGoStatus if user has closed the notification
					// without any action? It's kind of a feature now - without selecting
					// neverAgain, user can hide this statusbar item.
					removeGoStatus(STATUS_BAR_ITEM_NAME);
					selection?.command();
				});
		});
	}
=======
	files: {
		filename: string;
		os: string;
		arch: string;
		version: string;
		sha256: string;
		size: number;
		kind: string;
	}[];
}
async function fetchDownloadableGoVersions(): Promise<GoEnvironmentOption[]> {
	// fetch information about what Go versions are available to install
	const webResults = await WebRequest.json<GoVersionWebResult[]>('https://golang.org/dl/?mode=json');
	if (!webResults) {
		return [];
	}

	// turn the web result into GoEnvironmentOption model
	return webResults.reduce((opts, result: GoVersionWebResult) => {
		// TODO: allow downloading from different sites
		const dlPath = `go get golang.org/dl/${result.version}`;
		const label = result.version.replace('go', 'Go ');
		return [...opts, new GoEnvironmentOption(dlPath, label)];
	}, []);
>>>>>>> origin/dev.go2go
}
