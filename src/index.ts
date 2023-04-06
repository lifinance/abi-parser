import { green, red, yellow } from 'ansi-colors'
import * as dotenv from 'dotenv'

import { cacheAbi } from './abi-loader'
import { patchBigint } from './bigint/patch-bigint'
import { initChains } from './chains'
import { CallDataInformation } from './parser'
import { parseCallData } from './parser/calldata-parsers/parse-call-data'
import { bridge, bridgeSwap, feeBridge, stargateSwap, swap, swapBridge } from './testdata/encoded'

patchBigint()

dotenv.config()

const chains = initChains()

const cache = (c: CallDataInformation) =>
    // eslint-disable-next-line no-underscore-dangle
    [...(c.functionParameters._swapData || []), c.functionParameters._amarokData, c.functionParameters._stargateData]
        .filter((d) => d !== undefined && d.callTo !== undefined)
        .map(async (d) => cacheAbi(chains, (await d?.callTo) as string))

const run = async () => {
    const callDataStrings =
        process.argv.length === 2
            ? [swap, bridge, stargateSwap, bridgeSwap, swapBridge, feeBridge]
            : process.argv.slice(2)

    const parsed = await Promise.all(
        callDataStrings
            .map(async (callDataString) => {
                const parsedCandidates: CallDataInformation[] = parseCallData(callDataString)

                const resultString = `parsed ${parsedCandidates.length} matching function call(s):`

                console.log(parsedCandidates.length > 0 ? green(resultString) : yellow(resultString))

                await Promise.all(parsedCandidates.map(cache).flat())

                return parseCallData(callDataString)
            })
            .flat()
    )

    for (const candidate of parsed) {
        console.log(JSON.stringify(candidate, undefined, 4))
    }
}

run()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(red(error))
        process.exit(1)
    })
