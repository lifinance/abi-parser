#!/usr/bin/env node

import * as dotenv from 'dotenv'

import { CacheType, initCache } from './abi-cache'
import { log } from './lib/logger'
import { stringify } from './lib/stringify'
import { parseCallDataString } from './parse-call-data-string'
import {
  bridge,
  bridgeSwap,
  feeBridge,
  stargateSwap,
  swap,
  swapBridge,
} from './testdata/encoded'

dotenv.config()

const run = async () => {
  const cache = initCache(CacheType.FILE_SYSTEM)

  const callDataStrings =
    process.argv.length === 2
      ? [swap, bridge, stargateSwap, bridgeSwap, swapBridge, feeBridge]
      : process.argv.slice(2)

  const parsed = await Promise.all(
    callDataStrings
      .map((callDataString) => parseCallDataString(callDataString, cache))
      .flat()
  )

  for (const candidate of parsed) {
    try {
      log().info(stringify(candidate))
    } catch (e) {
      log().error((e as Error).message)
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    log().error((error as Error).message)
    process.exit(1)
  })
