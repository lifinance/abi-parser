import { Chain } from './chain'
import { ChainConfig } from './chain-config'
import { createChain } from './create-chain'

export const initChains = (): Array<ChainConfig> => [
    createChain(Chain.ETH, 'api.etherscan.io', process.env.ETH_API_KEY),
    createChain(Chain.POLYGON, 'api.polygonscan.com', process.env.POLYGON_API_KEY),
    createChain(Chain.ARBITRUM, 'api.arbiscan.io', process.env.POLYGON_API_KEY)
]
