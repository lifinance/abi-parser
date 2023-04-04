import { green, red, yellow } from 'ansi-colors'

import * as dotenv from 'dotenv'
import { cacheAbi } from '../services/abi-loader'

import { CallDataInformation, parseCallData } from '../services/abi-parser'
import { patchBigint } from '../services/bigint/patch-bigint'
import { initChains } from '../services/chains/init-chains'
import { bridge, bridgeSwap, feeBridge, stargateSwap, swap, swapBridge } from '../services/testdata/encoded'

patchBigint()

dotenv.config()

const chains = initChains()

const cache = (candidates: Array<CallDataInformation>) => {
    return Promise.all(
        candidates.map((c) => {
            ;[...(c.functionParameters._swapData || []), c.functionParameters._amarokData, c.functionParameters._stargateData]
                .filter((d) => d !== undefined && d.callTo !== undefined)
                .map((d) => cacheAbi(chains, d.callTo as string))
        })
    )
}

const run = async () => {
    const callDataStrings = process.argv.length === 2 ? [swap, bridge, stargateSwap, bridgeSwap, swapBridge, feeBridge] : process.argv.slice(2)

    await Promise.all(
        callDataStrings.map(async (callDataString) => {
            const parsedCandidates: CallDataInformation[] = parseCallData(callDataString)

            const resultString = `parsed ${parsedCandidates.length} matching function call(s):`
            console.log(parsedCandidates.length > 0 ? green(resultString) : yellow(resultString))

            await cache(parsedCandidates)

            for (const candidate of parseCallData(callDataString)) {
                console.log(JSON.stringify(candidate, undefined, 4))
            }
        })
    )
}

run()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(red(error))
        process.exit(1)
    })
