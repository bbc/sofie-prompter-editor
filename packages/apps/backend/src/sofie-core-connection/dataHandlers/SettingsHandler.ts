import {
	CoreConnection,
	PeripheralDeviceForDevice,
	PeripheralDeviceId,
	protectString,
} from '@sofie-automation/server-core-integration'
import { LoggerInstance, getLogLevel, isLogLevel, setLogLevel } from '../../lib/logger.js'
import { Store } from '../../data-stores/Store.js'
import { DataHandler } from './DataHandler.js'
import { Transformers } from '../dataTransformers/Transformers.js'

export class SettingsHandler extends DataHandler {
	public initialized: Promise<void>
	constructor(log: LoggerInstance, core: CoreConnection, store: Store, transformers: Transformers) {
		super(log.category('SettingsHandler'), core, store, transformers)

		this.initialized = Promise.resolve().then(async () => {
			//@ts-expect-error - TODO: fix this
			await this.core.autoSubscribe('peripheralDeviceForDevice', this.core.deviceId)

			//@ts-expect-error - TODO: fix this
			const observer = this.core.observe('peripheralDeviceForDevice')
			//@ts-expect-error - TODO: fix this
			observer.added = (id: PeripheralDeviceId) => this.onDeviceChanged(protectString(id))
			//@ts-expect-error - TODO: fix this
			observer.changed = (id: PeripheralDeviceId) => this.onDeviceChanged(protectString(id))
			this.observers.push(observer)
		})
	}
	private onDeviceChanged(id: PeripheralDeviceId): void {
		if (id === this.core.deviceId) {
			//@ts-expect-error - TODO: fix this
			const collection = this.core.getCollection<PeripheralDeviceForDevice>('peripheralDeviceForDevice')
			if (!collection) {
				this.log.error('collection "peripheralDevices" not found!')
				return
			}

			//@ts-expect-error - TODO: fix this
			const device = collection.findOne(id)
			//@ts-expect-error - TODO: fix this
			const deviceSettings: any = device?.deviceSettings ?? {} // TODO

			const logLevel = deviceSettings.debugLogging ? 'debug' : 'info'
			if (logLevel !== getLogLevel() && isLogLevel(logLevel)) {
				setLogLevel(logLevel)
			}
		}
	}
}
