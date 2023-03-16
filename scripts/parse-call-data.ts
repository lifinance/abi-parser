import { blue, green, red, yellow } from 'ansi-colors';
import { cacheAbi } from '../services/abi-loader';

import { CallDataInformation, ParameterMap, parseCallData } from '../services/abi-parser';
import { patchBigint } from '../services/bigint/patch-bigint';
import { initChains } from '../services/chains/init-chains';
import { bridge, bridgeSwap, feeBridge, stargateSwap, swap, swapBridge } from '../services/testdata/encoded';

import * as dotenv from 'dotenv';

patchBigint();

dotenv.config();

const chains = initChains();

const run = async () => {
    const callDataStrings =
        process.argv.length === 2
            ? [swap, bridge, stargateSwap, bridgeSwap, swapBridge, feeBridge]
            : process.argv.slice(2);

    for (const [index, callDataString] of callDataStrings.entries()) {
        if (index > 0) {
            console.log();
            console.log('--------------------------------------------------------------------------------');
            console.log();
        }

        console.log(blue(`parsing call data ${index + 1} of ${callDataStrings.length}`));

        const parsedCandidates: CallDataInformation[] = parseCallData(callDataString);

        const resultString = `parsed ${parsedCandidates.length} matching function call(s):`;
        console.log(parsedCandidates.length > 0 ? green(resultString) : yellow(resultString));

        for (const candidate of parsedCandidates) {
            const data = [
                ...(candidate.functionParameters._swapData || []),
                candidate.functionParameters._amarokData,
                candidate.functionParameters._stargateData,
            ].filter((d) => d !== undefined) as ParameterMap[];

            for (const swapData of data) {
                if (swapData.callTo) {
                    await cacheAbi(chains, swapData.callTo);
                }
            }

            const parsedCandidates: CallDataInformation[] = parseCallData(callDataString);
            for (const candidate of parsedCandidates) {
                console.log(JSON.stringify(candidate, undefined, 4));
            }
        }
    }
};

run()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(red(error));
        process.exit(1);
    });
