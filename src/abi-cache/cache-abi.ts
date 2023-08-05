import { getAbi, initChains } from '../chains'

import { AbiCache, ContractLocation } from './abi-cache'

export const cacheAbi = async (
  cache: AbiCache,
  address: string
): Promise<void> => {
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
