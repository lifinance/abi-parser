import { AbiCache, CacheType, initCache, cacheCandidates } from './abi-cache'
import { CallDataInformation } from './parser'
import { parseCallData } from './parser/calldata-parsers/parse-call-data'

export const parseCallDataString = async (
  callDataString: string,
  abiCache?: AbiCache
): Promise<CallDataInformation[]> => {
  const cache: AbiCache = abiCache
    ? abiCache
    : await initCache(CacheType.MEMORY)

  const parsedCandidates: CallDataInformation[] = parseCallData(
    callDataString,
    cache
  )

  await Promise.all(
    parsedCandidates.map((candidate) => cacheCandidates(cache, candidate))
  )

  return parseCallData(callDataString, cache)
}
