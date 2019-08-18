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

import { Object3D } from 'three';
import { Storage, Table } from '../..';
import { IAnimatable, IAnimation } from '../../game/ianimatable';
import { IHittable } from '../../game/ihittable';
import { IRenderable } from '../../game/irenderable';
import { Player } from '../../game/player';
import { Matrix3D } from '../../math/matrix3d';
import { FireEvents } from '../../physics/fire-events';
import { HitObject } from '../../physics/hit-object';
import { Meshes } from '../item-data';
import { TriggerData } from './trigger-data';
import { TriggerEvents } from './trigger-events';
import { TriggerHitCircle } from './trigger-hit-circle';
import { TriggerHitGenerator } from './trigger-hit-generator';
import { TriggerMeshGenerator } from './trigger-mesh-generator';
import { TriggerState } from './trigger-state';

/**
 * VPinball's triggers.
 *
 * @see https://github.com/vpinball/vpinball/blob/master/trigger.cpp
 */
export class Trigger implements IRenderable, IHittable, IAnimatable<TriggerState> {

	public static ShapeTriggerNone = 0;
	public static ShapeTriggerWireA = 1;
	public static ShapeTriggerStar = 2;
	public static ShapeTriggerWireB = 3;
	public static ShapeTriggerButton = 4;
	public static ShapeTriggerWireC = 5;
	public static ShapeTriggerWireD = 6;

	private readonly data: TriggerData;
	private readonly state: TriggerState;
	private readonly meshGenerator: TriggerMeshGenerator;
	private readonly hitGenerator: TriggerHitGenerator;

	private events?: TriggerEvents;
	private hits!: Array<HitObject<FireEvents>>;

	public static async fromStorage(storage: Storage, itemName: string): Promise<Trigger> {
		const data = await TriggerData.fromStorage(storage, itemName);
		return new Trigger(data);
	}

	private constructor(data: TriggerData) {
		this.data = data;
		this.state = new TriggerState(data.getName(), 0);
		this.meshGenerator = new TriggerMeshGenerator(data);
		this.hitGenerator = new TriggerHitGenerator(data);
	}

	public getName() {
		return this.data.getName();
	}

	public getState(): TriggerState {
		return this.state;
	}

	public isVisible(): boolean {
		return this.data.isVisible && this.data.shape !== Trigger.ShapeTriggerNone;
	}

	public isCollidable(): boolean {
		return true;
	}

	public getMeshes(table: Table): Meshes {
		return {
			trigger: {
				mesh: this.meshGenerator.getMesh(table).transform(new Matrix3D().toRightHanded()),
				material: table.getMaterial(this.data.szMaterial),
			},
		};
	}

	public setupPlayer(player: Player, table: Table): void {
		this.events = new TriggerEvents(this.data, this.state, this);
		if (this.data.shape === Trigger.ShapeTriggerStar || this.data.shape === Trigger.ShapeTriggerButton) {
			this.hits = [ new TriggerHitCircle(this.data, this.events, table) ];

		} else {
			this.hits = this.hitGenerator.generateHitObjects(this.events, table);
		}
	}

	public getHitShapes(): Array<HitObject<FireEvents>> {
		return this.hits;
	}

	public getAnimation(): IAnimation {
		return this.events!;
	}

	public applyState(obj: Object3D, table: Table, player: Player): void {
		// TODO
	}
}
