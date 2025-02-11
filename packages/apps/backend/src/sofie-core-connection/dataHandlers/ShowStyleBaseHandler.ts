import { Collection, CoreConnection, protectString } from '@sofie-automation/server-core-integration'
import { LoggerInstance } from '../../lib/logger.js'
import { Store } from '../../data-stores/Store.js'
import * as Core from '../CoreDataTypes/index.js'
import { DataHandler } from './DataHandler.js'
import { Transformers } from '../dataTransformers/Transformers.js'

export class ShowStyleBaseHandler extends DataHandler {
	public initialized: Promise<void>

	constructor(log: LoggerInstance, core: CoreConnection, store: Store, transformers: Transformers) {
		super(log.category('ShowStyleBaseHandler'), core, store, transformers)

		this.initialized = Promise.resolve().then(async () => {
			{
				//@ts-expect-error - TODO: fix this
				const observer = this.core.observe('showStyleBases')
				//@ts-expect-error - TODO: fix this
				observer.added = (id: PeripheralDeviceId) => this._updateData(protectString(id))
				//@ts-expect-error - TODO: fix this
				observer.changed = (id: PeripheralDeviceId) => this._updateData(protectString(id))
				//@ts-expect-error - TODO: fix this
				observer.removed = (id: PeripheralDeviceId) => this._updateData(protectString(id))
				this.observers.push(observer)
			}
		})
	}

	private _updateData(_id: Core.ShowStyleBaseId): void {
		const showStyleBase = this.showStyleBases.findOne(_id)
		this.transformers.parts.updateCoreShowStyleBase(_id, showStyleBase)
	}
	private get showStyleBases(): Collection<Core.DBShowStyleBase> {
		//@ts-expect-error - TODO: fix this
		const collection = this.core.getCollection<Core.DBShowStyleBase>('showStyleBases')
		if (!collection) {
			this.log.error('collection "showStyleBases" not found!')
			throw new Error('collection "showStyleBases" not found!')
		}
		return collection as any as Collection<Core.DBShowStyleBase>
	}
}
