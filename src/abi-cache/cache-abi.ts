import { getAbi, initChains } from '../chains'

import { ContractLocation } from './abi-cache'
import { cache } from './cache'

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
