import { ChainId } from '@lifi/types'

import { ChainConfig } from './chain-config'
import { createChain } from './create-chain'

export const initChains = (): Array<ChainConfig> => [
    createChain(ChainId.ETH, 'api.etherscan.io', process.env.ETH_API_KEY),
    createChain(ChainId.POL, 'api.polygonscan.com', process.env.POL_API_KEY),
    createChain(ChainId.ARB, 'api.arbiscan.io', process.env.ARB_API_KEY)
]
