import { AbiCache } from './abi-cache'
import { FileSystemAbiCache } from './file-system-abi-cache'
import { MemoryAbiCache } from './memory-abi-cache'

export enum CacheType {
  MEMORY,
  FILE_SYSTEM,
  REDIS = 3,
}

let cache: AbiCache

export const initCache = (cacheType: CacheType): AbiCache => {
  if (!cache) {
    switch (cacheType) {
      case CacheType.FILE_SYSTEM: {
        cache = new FileSystemAbiCache(
          process.env.ABI_DIRECTORY ?? '/tmp/abi-parser'
        )
        break
      }
      case CacheType.MEMORY: {
        cache = new MemoryAbiCache()
        break
      }
      default: {
        throw new Error(`Cache type ${cacheType} not supported`)
      }
    }
  }

  return cache
}
