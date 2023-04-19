#!/usr/bin/env node
/*
 * VPDB - Virtual Pinball Database
 * Copyright (C) 2019 freezy <freezy@vpdb.io>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { closeSync, existsSync, futimesSync, lstatSync, openSync, readdirSync, statSync, writeFileSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { NodeBinaryReader } from '../lib/io/binary-reader.node';
import { Table } from '../lib/vpt/table/table';

/* tslint:disable: no-console */
(async () => {

	try {

		const argSrc = process.argv[2];
		if (!argSrc) {
			console.log('Prints or saves the table data of a Visual Pinball table.\n\nUSAGE: vptdata <source.vpx | folder> [--save]\n');
			return;
		}

		const vpxPath = resolve(argSrc);
		if (!existsSync(vpxPath)) {
			throw new Error(`The path "${vpxPath}" does not exist.`);
		}

		const writeToFile = process.argv.includes('--save');
		const isFolder = lstatSync(vpxPath).isDirectory();
		let vpxFiles: string[];
		if (isFolder) {
			vpxFiles = readdirSync(vpxPath)
				.filter(f => /\.vp[xt]$/i.test(f))
				.map(f => resolve(vpxPath, f));
		} else {
			if (!/\.vp[xt]$/i.test(vpxPath)) {
				throw new Error('File must be a .vpx or .vpt file.');
			}
			vpxFiles = [vpxPath];
		}
		for (const vpxFile of vpxFiles) {

			try {
				const vpt = await Table.load(new NodeBinaryReader(vpxFile), {
					loadTableScript: true,
					skipMeshes: true,
					// loadInvisibleItems: true
				});

				const result = {
					data: vpt.data,
					info: vpt.info,
					items_count: Object.keys(vpt.items).length,
					textures_count: Object.keys(vpt.textures).length,
					collections_count: Object.keys(vpt.collections).length,
					script_length: vpt.getTableScript().length
				}

				if (writeToFile) {
					const destPath = dirname(vpxFile);
					const destName = basename(vpxFile);
					const destFile = resolve(destPath, destName.substr(0, destName.length - 3) + 'json');

					console.log('[vptdata] Writing to "%s".', destFile);
					//!!
					const json = JSON.stringify(result, null, 2)
					writeFileSync(destFile, json);

					// update timestamp
					const srcStat = statSync(vpxFile);
					const destFs = openSync(destFile, 'r+');
					futimesSync(destFs, srcStat.atime, srcStat.mtime);
					closeSync(destFs);

				} else {
					console.log(JSON.stringify(result, null, 2))
				}
			} catch (error) {
				console.error(error);
			}

		}

	} catch (err) {
		console.error(err);

	} finally {
		process.exit();
	}

})();
