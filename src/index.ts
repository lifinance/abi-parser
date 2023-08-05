import { green, red, yellow } from 'ansi-colors'
import * as dotenv from 'dotenv'

import { CacheType, initCache } from './abi-cache/cache'
import { cacheCandidates } from './abi-cache/cache-candidates'
import { stringify } from './lib/stringify'
import { CallDataInformation } from './parser'
import { parseCallData } from './parser/calldata-parsers/parse-call-data'
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
      .map(async (callDataString) => {
        const parsedCandidates: CallDataInformation[] =
          parseCallData(callDataString)

        const resultString = `parsed ${parsedCandidates.length} matching function call(s):`

        console.log(
          parsedCandidates.length > 0
            ? green(resultString)
            : yellow(resultString)
        )

        await Promise.all(parsedCandidates.map(cacheCandidates))

        return parseCallData(callDataString)
      })
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
