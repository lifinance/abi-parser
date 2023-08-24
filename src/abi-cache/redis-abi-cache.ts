import { Redis, RedisOptions } from 'ioredis'

import { stringify } from '../lib/stringify'

import { AbiCache, AbiInformation } from './abi-cache'

export class RedisAbiCache extends AbiCache {
  private redis: Redis
  private cachePrefix = 'ABICACHE:'

  constructor(redisOptions: RedisOptions) {
    super()
    this.redis = new Redis({ ...redisOptions, keyPrefix: this.cachePrefix })
  }

  public override async init(): Promise<AbiCache> {
    const keys = await this.redis.keys(`${this.cachePrefix}*`)

    await Promise.all(
      keys.map(async (key: string) => {
        const abiKey = key.replace(`${this.cachePrefix}`, '')
        const abi = await this.redis.get(abiKey)

        if (abi) {
          this.loadFromString(abiKey, abi)
        }
      })
    )

    return Promise.resolve(this)
  }

  protected override async persist(
    key: string,
    abi: AbiInformation
  ): Promise<void> {
    await this.redis.set(key, stringify(abi))
  }
}
