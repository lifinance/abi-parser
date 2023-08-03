import { CallDataInformation } from '../parser'

import { cacheAbi } from './cache-abi'

/*
 * This function extracts all addresses from the call data and caches their ABIs.
 * After calling `parseCallData`, `cacheCandidates` is called to cache all ABIs followed by
 * `parseCallData` again to parse the call data with the cached ABIs.
 */
export const cacheCandidates = async (
  c: CallDataInformation
): Promise<void> => {
  await Promise.all(
    [
      // eslint-disable-next-line no-underscore-dangle
      ...(c.functionParameters._swapData || []),
      // eslint-disable-next-line no-underscore-dangle
      c.functionParameters._amarokData,
      // eslint-disable-next-line no-underscore-dangle
      c.functionParameters._stargateData,
    ]
      .filter((d) => d !== undefined && d.callTo !== undefined)
      .map((d) => cacheAbi(d?.callTo as string))
  )
}
