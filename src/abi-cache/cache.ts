import { RedisOptions } from 'ioredis'

import { AbiCache } from './abi-cache'
import { FileSystemAbiCache } from './file-system-abi-cache'
import { MemoryAbiCache } from './memory-abi-cache'
import { RedisAbiCache } from './redis-abi-cache'

export enum CacheType {
  MEMORY,
  FILE_SYSTEM,
  REDIS = 3,
}

let cache: AbiCache

export const initCache = async (
  cacheType: CacheType,
  redisOptions?: RedisOptions
): Promise<AbiCache> => {
  if (!cache) {
    switch (cacheType) {
      case CacheType.FILE_SYSTEM: {
        cache = new FileSystemAbiCache(
          process.env.ABI_DIRECTORY ?? '/tmp/abi-parser'
        )
        await cache.init()
        break
      }
      case CacheType.MEMORY: {
        cache = new MemoryAbiCache()
        await cache.init()
        break
      }
      case CacheType.REDIS: {
        cache = new RedisAbiCache(redisOptions || {})
        await cache.init()
        break
      }
      default: {
        throw new Error(`Cache type ${cacheType} not supported`)
      }
    }
  }

  return cache
}
