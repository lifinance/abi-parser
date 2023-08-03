import { AbiCache, AbiInformation } from './abi-cache'

export class MemoryAbiCache extends AbiCache {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override persist(_key: string, _: AbiInformation): void {
    // console.log(`Using Memory cache, not persisting ABI ${key}`)
  }
}
