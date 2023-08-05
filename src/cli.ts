import { red } from 'ansi-colors'
import * as dotenv from 'dotenv'

import { CacheType, initCache } from './abi-cache/cache'
import { parseCallDataString } from '.'
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

initCache(CacheType.FILE_SYSTEM)

const run = async () => {
  const callDataStrings =
    process.argv.length === 2
      ? [swap, bridge, stargateSwap, bridgeSwap, swapBridge, feeBridge]
      : process.argv.slice(2)

  const parsed = await Promise.all(
    callDataStrings
      .map((callDataString) => parseCallDataString(callDataString))
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
