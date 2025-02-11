import { Collection, CoreConnection, protectString } from '@sofie-automation/server-core-integration'
import { LoggerInstance } from '../../lib/logger.js'
import { Store } from '../../data-stores/Store.js'
import * as Core from '../CoreDataTypes/index.js'
import { DataHandler } from './DataHandler.js'
import { Transformers } from '../dataTransformers/Transformers.js'

export class RundownHandler extends DataHandler {
	public initialized: Promise<void>
	constructor(log: LoggerInstance, core: CoreConnection, store: Store, transformers: Transformers) {
		super(log.category('RundownHandler'), core, store, transformers)

		this.initialized = Promise.resolve().then(async () => {
			//@ts-expect-error - TODO: fix this
			const observer = this.core.observe('rundowns')
			//@ts-expect-error - TODO: fix this
			observer.added = (id: PeripheralDeviceId) => this.onAdded(protectString(id))
			//@ts-expect-error - TODO: fix this
			observer.changed = (id: PeripheralDeviceId) => this.onChanged(protectString(id))
			//@ts-expect-error - TODO: fix this
			observer.removed = (id: PeripheralDeviceId) => this.onRemoved(protectString(id))
			this.observers.push(observer)
		})
	}
	private onAdded(id: Core.RundownId): void {
		this.log.debug('onAdded ' + id)
		this.transformers.rundowns.updateCoreRundown(id, this.collection.findOne(id))
	}
	private onChanged(id: Core.RundownId): void {
		this.log.debug('onChanged ' + id)
		this.transformers.rundowns.updateCoreRundown(id, this.collection.findOne(id))
	}
	private onRemoved(id: Core.RundownId): void {
		this.log.debug('onRemoved ' + id)
		this.transformers.rundowns.updateCoreRundown(id, undefined)
	}

	private get collection(): Collection<Core.DBRundown> {
		//@ts-expect-error - TODO: fix this
		const collection = this.core.getCollection<Core.DBRundown>('rundowns')
		if (!collection) {
			this.log.error('collection "rundowns" not found!')
			throw new Error('collection "rundowns" not found!')
		}
		return collection as any as Collection<Core.DBRundown>
	}
}
