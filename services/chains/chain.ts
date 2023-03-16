import { ChainConfig } from './chain-config';

export enum Chain {
    ETH = 1,
    POLYGON = 137,
}
export const createChain = (chain: Chain, apiHost: string, apiKey?: string): ChainConfig => {
    return { chain, apiHost, apiKey };
};
