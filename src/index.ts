import { green, red, yellow } from 'ansi-colors'
import * as dotenv from 'dotenv'

import { ContractLocation } from './abi-cache/abi-cache'
import { cache, CacheType, initCache } from './abi-cache/cache'
import { patchBigint } from './bigint/patch-bigint'
import { getAbi, initChains } from './chains'
import { CallDataInformation } from './parser'
import { parseCallData } from './parser/calldata-parsers/parse-call-data'
import { bridge, bridgeSwap, feeBridge, stargateSwap, swap, swapBridge } from './testdata/encoded'

patchBigint()

dotenv.config()

initCache(CacheType.FILE_SYSTEM)

export const cacheAbi = async (address: string): Promise<void> => {
    const chains = initChains()

    await Promise.all(
        chains.map(async (chainConfig) => {
            const { chain } = chainConfig
            const location = { address, chain } as ContractLocation

            if (!cache.has(location)) {
                const abi = await getAbi(chainConfig, address)

                if (abi) {
                    cache.set(location, JSON.parse(abi))
                }
            }

            return Promise.resolve()
        })
    )
}

/*
 * This function extracts all addresses from the call data and caches their ABIs.
 * After calling `parseCallData`, `cacheCandidates` is called to cache all ABIs followed by
 * `parseCallData` again to parse the call data with the cached ABIs.
 */
const cacheCandidates = async (c: CallDataInformation) => {
    // eslint-disable-next-line no-underscore-dangle
    await Promise.all(
        [
            ...(c.functionParameters._swapData || []),
            c.functionParameters._amarokData,
            c.functionParameters._stargateData
        ]
            .filter((d) => d !== undefined && d.callTo !== undefined)
            .map((d) => cacheAbi(d?.callTo as string))
    )
}

const run = async () => {
    const callDataStrings =
        process.argv.length === 2
            ? [swap, bridge, stargateSwap, bridgeSwap, swapBridge, feeBridge]
            : process.argv.slice(2)

    // await cacheAbi('0x214d52880b1e4E17d020908cd8EAa988FfDD4020')

    const parsed = await Promise.all(
        callDataStrings
            .map(async (callDataString) => {
                const parsedCandidates: CallDataInformation[] = parseCallData(callDataString)

                const resultString = `parsed ${parsedCandidates.length} matching function call(s):`

                console.log(parsedCandidates.length > 0 ? green(resultString) : yellow(resultString))

                await Promise.all(parsedCandidates.map(cacheCandidates))

                return parseCallData(callDataString)
            })
            .flat()
    )

    for (const candidate of parsed) {
        try {
            console.log(JSON.stringify(candidate, undefined, 4))
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
