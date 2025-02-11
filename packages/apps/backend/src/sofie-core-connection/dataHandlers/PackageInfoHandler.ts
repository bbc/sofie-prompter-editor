import { Collection, CoreConnection, protectString } from '@sofie-automation/server-core-integration'
import { LoggerInstance } from '../../lib/logger.js'
import { Store } from '../../data-stores/Store.js'
import * as Core from '../CoreDataTypes/index.js'
import { DataHandler } from './DataHandler.js'
import { Transformers } from '../dataTransformers/Transformers.js'

export class PackageInfoHandler extends DataHandler {
	public initialized: Promise<void>

	constructor(log: LoggerInstance, core: CoreConnection, store: Store, transformers: Transformers) {
		super(log.category('PackageInfoHandler'), core, store, transformers)

		this.initialized = Promise.resolve().then(async () => {
			//@ts-expect-error - TODO: fix this
			const observer = this.core.observe('packageInfos')
			//@ts-expect-error - TODO: fix this
			observer.added = (id: PeripheralDeviceId) => this._updatePackageInfo(protectString(id))
			//@ts-expect-error - TODO: fix this
			observer.changed = (id: PeripheralDeviceId) => this._updatePackageInfo(protectString(id))
			//@ts-expect-error - TODO: fix this
			observer.removed = (id: PeripheralDeviceId) => this._updatePackageInfo(protectString(id))
			this.observers.push(observer)
		})
	}

	private _updatePackageInfo(packageInfoId: Core.PackageInfoId): void {
		const packageInfo = this.packageInfos.findOne(packageInfoId)
		this.transformers.expectedPackages.updateCoreScriptPackageInfo(packageInfoId, packageInfo)
	}
	private get packageInfos(): Collection<Core.PackageInfoDB> {
		//@ts-expect-error - TODO: fix this
		const collection = this.core.getCollection<Core.PackageInfoDB>('packageInfos')
		if (!collection) {
			this.log.error('collection "packageInfos" not found!')
			throw new Error('collection "packageInfos" not found!')
		}
		return collection as any as Collection<Core.PackageInfoDB>
	}
}
