import { ChainId } from '@lifi/types'

export interface ChainConfig {
  chain: ChainId
  apiHost: string
  apiKey?: string
}
