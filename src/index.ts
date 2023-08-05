import { CacheType, initCache } from './abi-cache/cache'
import { cacheCandidates } from './abi-cache/cache-candidates'
import { CallDataInformation } from './parser'
import { parseCallData } from './parser/calldata-parsers/parse-call-data'

export { CacheType } from './abi-cache/cache'
export const parseCallDataString = async (
  callDataString: string,
  cacheType: CacheType = CacheType.MEMORY
): Promise<CallDataInformation[]> => {
  initCache(cacheType)
  const parsedCandidates: CallDataInformation[] = parseCallData(callDataString)

  await Promise.all(parsedCandidates.map(cacheCandidates))

  return parseCallData(callDataString)
}
