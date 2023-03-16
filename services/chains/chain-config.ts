import { Chain } from './chain';

export interface ChainConfig {
    chain: Chain;
    apiHost: string;
    apiKey?: string;
}
