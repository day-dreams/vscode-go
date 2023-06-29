<<<<<<< HEAD
/* eslint-disable @typescript-eslint/no-unused-vars */
=======
>>>>>>> origin/dev.go2go
/*---------------------------------------------------------
 * Copyright 2020 The Go Authors. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

<<<<<<< HEAD
import assert from 'assert';
import { applyCodeCoverageToAllEditors, coverageFilesForTest, initForTest } from '../../src/goCover';
import { updateGoVarsFromConfig } from '../../src/goInstallTools';
import path = require('path');
import vscode = require('vscode');
=======
import * as assert from 'assert';
import fs = require('fs-extra');
import path = require('path');
import sinon = require('sinon');
import vscode = require('vscode');
import { applyCodeCoverageToAllEditors, coverageFilesForTest, initForTest } from '../../src/goCover';
import { updateGoVarsFromConfig } from '../../src/goInstallTools';
import { getCurrentGoPath, getWorkspaceFolderPath } from '../../src/util';
>>>>>>> origin/dev.go2go

// The ideal test would check that each open editor containing a file with coverage
// information is displayed correctly. We cannot see the applied decorations, so the
// test checks that the cover.out file has been read correctly, and the import paths
// have been correctly converted to file system paths, which are what vscode uses.
suite('Coverage for tests', function () {
	this.timeout(10000);

	let fixtureSourcePath: string;
	let coverFilePath: string;

	suiteSetup(async () => {
<<<<<<< HEAD
		await updateGoVarsFromConfig({});

		// Set up the test fixtures.
		fixtureSourcePath = path.join(__dirname, '..', '..', '..', 'test', 'testdata', 'coverage');
=======
		await updateGoVarsFromConfig();

		// Set up the test fixtures.
		fixtureSourcePath = path.join(__dirname, '..', '..', '..', 'test', 'fixtures', 'coverage');
>>>>>>> origin/dev.go2go
		coverFilePath = path.join(fixtureSourcePath, 'cover.out');
		return;
	});
	test('resolve import paths', async () => {
		initForTest();
		const x = vscode.workspace.openTextDocument(coverFilePath);
		await applyCodeCoverageToAllEditors(coverFilePath, fixtureSourcePath);
<<<<<<< HEAD
		const files = Object.keys(coverageFilesForTest());
		const aDotGo = files.includes(path.join(fixtureSourcePath, 'a', 'a.go'));
		const bDotGo = files.includes(path.join(fixtureSourcePath, 'b', 'b.go'));
		// Coverage data (cover.out) contains a couple of bogus data with file name blah.go. They shouldn't appear.
		const blahDotGo = files.includes(path.join(fixtureSourcePath, 'b', 'blah.go'));
		assert(
			aDotGo && bDotGo && !blahDotGo,
			`!seen a.go:${aDotGo} or !seen b.go:${bDotGo} or seen blah.go:${blahDotGo}: ${files}\n`
		);
=======
		let aDotGo: boolean;
		let bDotGo: boolean;
		for (const fn in coverageFilesForTest()) {
			if (true) { // TSLint insists the body for for..in.. be an if-statement
				if (fn === `${fixtureSourcePath}/a/a.go`) { aDotGo = true; }
				if (fn === `${fixtureSourcePath}/b/b.go`) { bDotGo = true; }
		}
	}
		assert.equal(aDotGo && bDotGo, true);
>>>>>>> origin/dev.go2go
	});
});
