import { Chain } from './chain'
import { ChainConfig } from './chain-config'

export const createChain = (chain: Chain, apiHost: string, apiKey?: string): ChainConfig => ({ chain, apiHost, apiKey })
