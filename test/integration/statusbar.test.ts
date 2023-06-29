<<<<<<< HEAD
/* eslint-disable no-prototype-builtins */
/* eslint-disable node/no-unpublished-import */
=======
>>>>>>> origin/dev.go2go
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Modification copyright 2020 The Go Authors. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/

<<<<<<< HEAD
import assert from 'assert';
=======
import * as assert from 'assert';
import * as cp from 'child_process';
>>>>>>> origin/dev.go2go
import * as fs from 'fs-extra';
import { describe, it } from 'mocha';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
<<<<<<< HEAD
import * as vscode from 'vscode';
import {
=======
import * as util from 'util';
import * as vscode from 'vscode';

import {
	disposeGoStatusBar,
>>>>>>> origin/dev.go2go
	formatGoVersion,
	getGoEnvironmentStatusbarItem,
	getSelectedGo,
	GoEnvironmentOption,
<<<<<<< HEAD
	setSelectedGo
} from '../../src/goEnvironmentStatus';
import { updateGoVarsFromConfig } from '../../src/goInstallTools';
import { disposeGoStatusBar } from '../../src/goStatus';
import { getWorkspaceState, setWorkspaceState } from '../../src/stateUtils';
import { MockMemento } from '../mocks/MockMemento';

import ourutil = require('../../src/util');
import { setGOROOTEnvVar } from '../../src/goEnv';

describe('#initGoStatusBar()', function () {
	this.beforeAll(async () => {
		await updateGoVarsFromConfig({}); // should initialize the status bar.
=======
	setSelectedGo,
} from '../../src/goEnvironmentStatus';
import { updateGoVarsFromConfig } from '../../src/goInstallTools';
import { getCurrentGoRoot } from '../../src/goPath';
import ourutil = require('../../src/util');

describe('#initGoStatusBar()', function () {
	this.beforeAll(async () => {
		await updateGoVarsFromConfig();  // should initialize the status bar.
>>>>>>> origin/dev.go2go
	});

	this.afterAll(() => {
		disposeGoStatusBar();
	});

	it('should create a status bar item', () => {
		assert.notEqual(getGoEnvironmentStatusbarItem(), undefined);
	});

	it('should create a status bar item with a label matching go.goroot version', async () => {
		const version = await ourutil.getGoVersion();
<<<<<<< HEAD
		const versionLabel = formatGoVersion(version);
		let label = getGoEnvironmentStatusbarItem().text;
		const iconPos = label.indexOf('$');
		if (iconPos >= 0) {
			label = label.substring(0, iconPos);
		}
		assert.equal(label, versionLabel, 'goroot version does not match status bar item text');
	});
});

describe('#setGOROOTEnvVar', function () {
	let origGOROOT = process.env['GOROOT'];

	this.beforeEach(() => {
		origGOROOT = process.env['GOROOT'];
	});

	this.afterEach(() => {
		if (origGOROOT) {
			process.env['GOROOT'] = origGOROOT;
		} else {
			delete process.env.GOROOT;
		}
	});

	it('empty goroot does not change GOROOT', async () => {
		await setGOROOTEnvVar('');
		assert.strictEqual(process.env['GOROOT'], origGOROOT);
	});

	it('non-directory value is rejected', async () => {
		await setGOROOTEnvVar(ourutil.getBinPath('go'));
		assert.strictEqual(process.env['GOROOT'], origGOROOT);
	});

	it('directory value is accepted', async () => {
		const goroot = path.join(path.dirname(ourutil.getBinPath('go')), '..');
		await setGOROOTEnvVar(goroot);
		assert.strictEqual(process.env['GOROOT'], goroot);
	});
});

describe('#setSelectedGo()', function () {
	this.timeout(40000);
	let sandbox: sinon.SinonSandbox | undefined;
	let goOption: GoEnvironmentOption;
	let defaultMemento: vscode.Memento;

	this.beforeAll(async () => {
		const version = await ourutil.getGoVersion();
		const defaultGoOption = new GoEnvironmentOption(version.binaryPath, formatGoVersion(version));
		defaultMemento = getWorkspaceState();
		setWorkspaceState(new MockMemento());
		await setSelectedGo(defaultGoOption);
	});
	this.afterAll(async () => {
		setWorkspaceState(defaultMemento);
	});
=======
		const versionLabel = formatGoVersion(version.format());
		assert.equal(
			getGoEnvironmentStatusbarItem().text,
			versionLabel,
			'goroot version does not match status bar item text'
		);
	});
});

describe.skip('#setSelectedGo()', function () {
	// Disabled due to https://github.com/golang/vscode-go/issues/303.
	this.timeout(20000);
	let sandbox: sinon.SinonSandbox | undefined;
	let goOption: GoEnvironmentOption;
	let defaultGoConfig: vscode.WorkspaceConfiguration;

	this.beforeAll(async () => {
		defaultGoConfig = ourutil.getGoConfig();
	});

>>>>>>> origin/dev.go2go
	this.beforeEach(async () => {
		goOption = await getSelectedGo();
		sandbox = sinon.createSandbox();
	});
	this.afterEach(async () => {
<<<<<<< HEAD
		await setSelectedGo(goOption, false);
		sandbox!.restore();
	});

	it('should update the workspace memento storage', async () => {
		// set workspace setting
		const workspaceTestOption = new GoEnvironmentOption('workspacetestpath', 'testlabel');
		await setSelectedGo(workspaceTestOption, false);

		// check that the new config is set
		assert.equal(getSelectedGo()?.binpath, 'workspacetestpath');
	});

	it.skip('should download an uninstalled version of Go', async () => {
		// TODO(https://github.com/golang/vscode-go/issues/1454): temporarily disabled
		// to unblock nightly release during investigation.
		if (!process.env['VSCODEGO_BEFORE_RELEASE_TESTS']) {
			return;
		}

=======
		await setSelectedGo(goOption, vscode.ConfigurationTarget.Workspace, false);
		sandbox.restore();
	});

	it('should update the workspace settings.json', async () => {
		let tmpAltToolsWorkspace: any = {};
		let tmpAltToolsGlobal: any = {};
		const getGoConfigStub = sandbox.stub(ourutil, 'getGoConfig').returns({
			get: (s: string) => {
				if (s === 'alternateTools') { return tmpAltToolsWorkspace || tmpAltToolsGlobal; }
				return defaultGoConfig.get(s);
			},
			update: (key: string, value: any, scope: vscode.ConfigurationTarget) => {
				if (key === 'alternateTools') {
					if (scope === vscode.ConfigurationTarget.Global) {
						tmpAltToolsGlobal = value;
					} else {
						tmpAltToolsWorkspace = value;
					}
				}
			},
		} as vscode.WorkspaceConfiguration);

		// set workspace setting
		const workspaceTestOption = new GoEnvironmentOption('workspacetestpath', 'testlabel');
		await setSelectedGo(workspaceTestOption, vscode.ConfigurationTarget.Workspace, false);

		// check that the stub was called
		sandbox.assert.calledWith(getGoConfigStub);

		// check that the new config is set
		assert.equal(tmpAltToolsWorkspace['go'], 'workspacetestpath');
	});

	it('should download an uninstalled version of Go', async () => {
		if (!!process.env['VSCODEGO_BEFORE_RELEASE_TESTS']) {
			return;
		}

		let tmpAltToolsWorkspace = {};
		let tmpAltToolsGlobal = {};
		const getGoConfigStub = sandbox.stub(ourutil, 'getGoConfig').returns({
			get: (s: string) => {
				if (s === 'alternateTools') { return tmpAltToolsWorkspace || tmpAltToolsGlobal; }
				return defaultGoConfig.get(s);
			},
			update: (key: string, value: any, scope: vscode.ConfigurationTarget) => {
				if (key === 'alternateTools') {
					if (scope === vscode.ConfigurationTarget.Global) {
						tmpAltToolsGlobal = value;
					} else {
						tmpAltToolsWorkspace = value;
					}
				}
			},
		} as vscode.WorkspaceConfiguration);

>>>>>>> origin/dev.go2go
		// setup tmp home directory for sdk installation
		const envCache = Object.assign({}, process.env);
		process.env.HOME = os.tmpdir();

		// set selected go as a version to download
<<<<<<< HEAD
		const option = new GoEnvironmentOption('golang.org/dl/go1.13.12', 'Go 1.13.12', false);
		await setSelectedGo(option, false);
=======
		const option = new GoEnvironmentOption('go get golang.org/dl/go1.13.12', 'Go 1.13.12');
		await setSelectedGo(option, vscode.ConfigurationTarget.Workspace, false);
		sandbox.assert.calledWith(getGoConfigStub);
>>>>>>> origin/dev.go2go

		// the temp sdk directory should now contain go1.13.12
		const subdirs = await fs.readdir(path.join(os.tmpdir(), 'sdk'));
		assert.ok(subdirs.includes('go1.13.12'), 'Go 1.13.12 was not installed');

		// cleanup
		process.env = envCache;
	});
});
<<<<<<< HEAD
=======

describe('#updateGoVarsFromConfig()', function () {
	this.timeout(10000);

	let defaultGoConfig: vscode.WorkspaceConfiguration | undefined;
	let tmpRoot: string | undefined;
	let tmpRootBin: string | undefined;
	let sandbox: sinon.SinonSandbox | undefined;

	this.beforeAll(async () => {
		defaultGoConfig = ourutil.getGoConfig();

		tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rootchangetest'));
		tmpRootBin = path.join(tmpRoot, 'bin');

		// build a fake go binary and place it in tmpRootBin.
		fs.mkdirSync(tmpRootBin);

		const fixtureSourcePath = path.join(__dirname, '..', '..', '..', 'test', 'fixtures', 'testhelpers');
		const execFile = util.promisify(cp.execFile);
		const goRuntimePath = ourutil.getBinPath('go');
		const { stdout, stderr } = await execFile(
			goRuntimePath, ['build', '-o', path.join(tmpRootBin, 'go'), path.join(fixtureSourcePath, 'fakego.go')]);
		if (stderr) {
			assert.fail(`failed to build the fake go binary required for testing: ${stderr}`);
		}
	});

	this.afterAll(() => {
		ourutil.rmdirRecursive(tmpRoot);
	});

	this.beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	this.afterEach(() => {
		sandbox.restore();
	});

	function pathEnvVar(): string[] {
		let paths = [] as string[];
		if (process.env.hasOwnProperty('PATH')) {
			paths = process.env['PATH'].split(path.delimiter);
		} else if (process.platform === 'win32' && process.env.hasOwnProperty('Path')) {
			paths = process.env['Path'].split(path.delimiter);
		}
		return paths;
	}

	it('should have a sensible goroot with the default setting', async () => {
		await updateGoVarsFromConfig();

		const b = getGoEnvironmentStatusbarItem();
		assert.ok(b.text.startsWith('Go'), `go env statusbar item = ${b.text}, want "Go..."`);
		assert.equal(pathEnvVar()[0], [path.join(getCurrentGoRoot(), 'bin')],
			`the first element in PATH must match the current GOROOT/bin`);
	});

	it('should recognize the adjusted goroot using go.goroot', async () => {
		// stub geteGoConfig to return "go.goroot": tmpRoot.
		const getGoConfigStub = sandbox.stub(ourutil, 'getGoConfig').returns({
			get: (s: string) => {
				if (s === 'goroot') { return tmpRoot; }
				return defaultGoConfig.get(s);
			},
		} as vscode.WorkspaceConfiguration);

		// adjust the fake go binary's behavior.
		process.env['FAKEGOROOT'] = tmpRoot;
		process.env['FAKEGOVERSION'] = 'go version go2.0.0 darwin/amd64';

		await updateGoVarsFromConfig();

		sandbox.assert.calledWith(getGoConfigStub);
		assert.equal((await ourutil.getGoVersion()).format(), '2.0.0');
		assert.equal(getGoEnvironmentStatusbarItem().text, 'Go 2.0.0');
		assert.equal(pathEnvVar()[0], [path.join(getCurrentGoRoot(), 'bin')],
			`the first element in PATH must match the current GOROOT/bin`);
	});

	it('should recognize the adjusted goroot using go.alternateTools', async () => {
		// "go.alternateTools" : {"go": "go3"}
		fs.copyFileSync(path.join(tmpRootBin, 'go'), path.join(tmpRootBin, 'go3'));

		const getGoConfigStub = sandbox.stub(ourutil, 'getGoConfig').returns({
			get: (s: string) => {
				if (s === 'alternateTools') {
					return { go: path.join(tmpRootBin, 'go3') };
				}
				return defaultGoConfig.get(s);
			},
		} as vscode.WorkspaceConfiguration);

		process.env['FAKEGOROOT'] = tmpRoot;
		process.env['FAKEGOVERSION'] = 'go version go3.0.0 darwin/amd64';

		await updateGoVarsFromConfig();

		sandbox.assert.calledWith(getGoConfigStub);
		assert.equal((await ourutil.getGoVersion()).format(), '3.0.0');
		assert.equal(getGoEnvironmentStatusbarItem().text, 'Go 3.0.0');
		assert.equal(pathEnvVar()[0], [path.join(getCurrentGoRoot(), 'bin')],
			`the first element in PATH must match the current GOROOT/bin`);
	});
});
>>>>>>> origin/dev.go2go
