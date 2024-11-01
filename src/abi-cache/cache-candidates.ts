import { CallDataInformation } from '../parser'

import { AbiCache } from './abi-cache'
import { cacheAbi } from './cache-abi'

/*
 * This function extracts all addresses from the call data and caches their ABIs.
 * After calling `parseCallData`, `cacheCandidates` is called to cache all ABIs followed by
 * `parseCallData` again to parse the call data with the cached ABIs.
 */
export const cacheCandidates = async (
  cache: AbiCache,
  c: CallDataInformation
): Promise<void> => {
  const swapDataArray = Array.isArray(c.functionParameters._swapData)
    ? c.functionParameters._swapData
    : typeof c.functionParameters._swapData === 'object'
      ? [c.functionParameters._swapData]
      : []

  await Promise.all(
    [
      ...swapDataArray,
      // eslint-disable-next-line no-underscore-dangle
      c.functionParameters._amarokData,
      // eslint-disable-next-line no-underscore-dangle
      c.functionParameters._stargateData,
    ]
      .filter((d) => d !== undefined && d.callTo !== undefined)
      .map((d) => cacheAbi(cache, d?.callTo as string))
  )
}
