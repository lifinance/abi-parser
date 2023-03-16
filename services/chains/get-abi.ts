import { red } from 'ansi-colors';
import superagent from 'superagent';
import { ChainConfig } from './chain-config';

export const getAbi = async (chainConfig: ChainConfig, address: string): Promise<string | undefined> => {
    const res = await superagent
        .get(`https://${chainConfig.apiHost}/api`)
        .query('module=contract')
        .query('action=getabi')
        .query(`address=${address}`)
        .query(chainConfig.apiKey ? `apiKey=${chainConfig.apiKey}` : {});

    if (res.body.message.startsWith('OK')) {
        console.log(`loaded abi for ${address}`);

        return res.body.result as string;
    } else {
        console.log(red(`could not load abi for ${address}: ${res.body.message}`));
    }

    return undefined;
};
