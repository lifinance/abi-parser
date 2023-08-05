import { red } from 'ansi-colors'
import * as dotenv from 'dotenv'

import { parseCallDataString } from '.'
import { initCache, CacheType } from './abi-cache/cache'
import { stringify } from './lib/stringify'
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
      console.log(stringify(candidate))
    } catch (e) {
      console.log(e)
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(red(error))
    process.exit(1)
  })
