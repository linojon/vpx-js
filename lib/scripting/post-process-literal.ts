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

import { Literal } from 'estree';
import { Token } from 'moo';
import * as estree from './estree';

export function bool(result: [Token]): Literal {
	const value = result[0].type === 'kw_true';
	return estree.literal(value);
}

export function int(result: [Token]): Literal {
	const value = result[0].text;
	return estree.literal(parseInt(value, 10));
}

export function hex(result: [Token]): Literal {
	const value = '0x' + result[0].text.slice(2, -1);
	return estree.literal(parseInt(value, 16), value);
}

export function oct(result: [Token]): Literal {
	const value = '0' + result[0].text.slice(1, -1);
	return estree.literal(parseInt(value, 8), value);
}

export function float(result: [Token]): Literal {
	const value = result[0].text;
	return estree.literal(parseFloat(value));
}

export function string(result: [Token]): Literal {
	const value = result[0].text
		.slice(1, -1)
		.replace(/""/g, '"')
		.replace(/\\/g, '\\\\')
		.replace(/\t/g, '\\t');

	return estree.literal(value);
}

export function date(result: [Token]): Literal {
	const value = result[0].text.slice(1, -1);
	return estree.literal(value);
}

export function nothing(result: [Token]): Literal {
	return estree.literal(null);
}
