import { Chain, createChain } from './chain';
import { ChainConfig } from './chain-config';

export const initChains = (): Array<ChainConfig> => {
    return [
        createChain(Chain.ETH, 'api.etherscan.io', process.env.ETH_API_KEY),
        createChain(Chain.POLYGON, 'api.polygonscan.com', process.env.POLYGON_API_KEY),
    ];
};
