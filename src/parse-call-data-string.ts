import { AbiCache } from './abi-cache/abi-cache'
import { CacheType, initCache } from './abi-cache/cache'
import { cacheCandidates } from './abi-cache/cache-candidates'
import { CallDataInformation } from './parser'
import { parseCallData } from './parser/calldata-parsers/parse-call-data'

export const parseCallDataString = async (
  callDataString: string,
  cache: AbiCache = initCache(CacheType.MEMORY)
): Promise<CallDataInformation[]> => {
  const parsedCandidates: CallDataInformation[] = parseCallData(
    callDataString,
    cache
  )

  await Promise.all(
    parsedCandidates.map((candidate) => cacheCandidates(cache, candidate))
  )

  return parseCallData(callDataString, cache)
}
