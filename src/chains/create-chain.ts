import { ChainId } from '@lifi/types'

import { ChainConfig } from './chain-config'

export const createChain = (chain: ChainId, apiHost: string, apiKey?: string): ChainConfig => ({
    chain,
    apiHost,
    apiKey
})
