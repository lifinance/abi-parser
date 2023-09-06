import { log } from '../lib/logger'

import { AbiCache, AbiInformation } from './abi-cache'

export class MemoryAbiCache extends AbiCache {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override persist(key: string, _: AbiInformation): void {
    log().debug(`Using Memory cache, not persisting ABI ${key}`)
  }
}
