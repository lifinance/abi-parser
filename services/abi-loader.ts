import path from 'path';
import fs from 'fs';
import { ethers } from 'ethers';

const ABI_DIRECTORY = path.resolve(__dirname, '../abis');

export type AbiInformation = { fileName: string; ethersInterface: ethers.utils.Interface };
export type FunctionInformation = { fileName: string; functionFragment: ethers.utils.FunctionFragment };

let cachedAbis: Array<AbiInformation> | undefined = undefined;
let cachedFunctionFragmentsBySighash: { [sighash: string]: Array<FunctionInformation> } | undefined = undefined;

const loadAbisFromFileSystem = () => {
    const filesPaths = fs.readdirSync(ABI_DIRECTORY);
    const abis: typeof cachedAbis = [];

    for (const fileName of filesPaths) {
        const filePath = path.resolve(ABI_DIRECTORY, fileName);

        if (path.extname(filePath) !== '.json') {
            console.warn(`unexpected file extension in abi folder: "${path.basename(filePath)}"`);
            continue;
        }

        const fileContent = fs.readFileSync(filePath).toString();
        const ethersInterface = new ethers.utils.Interface(fileContent);
        abis.push({ fileName, ethersInterface });
    }

    return abis;
};

const groupFunctionFragmentsBySighash = (abis: Array<AbiInformation>) => {
    const functionFragmentsBySighash: typeof cachedFunctionFragmentsBySighash = {};

    for (const abi of abis) {
        for (const functionFragment of Object.values(abi.ethersInterface.functions)) {
            const functionSighash = ethers.utils.Interface.getSighash(functionFragment);
            if (!(functionSighash in functionFragmentsBySighash)) {
                functionFragmentsBySighash[functionSighash] = [];
            }

            functionFragmentsBySighash[functionSighash].push({ ...abi, functionFragment });
        }
    }

    return functionFragmentsBySighash;
};

export const getAbis = () => {
    // cache loaded abis to prevent accessing file system after the first invocation
    if (!cachedAbis) {
        cachedAbis = loadAbisFromFileSystem();
    }

    return cachedAbis;
};

export const getFunctionsBySighash = (sighash: string) => {
    // cache grouped function fragments to prevent iterating over all fragments after the first invocation
    if (!cachedFunctionFragmentsBySighash) {
        cachedFunctionFragmentsBySighash = groupFunctionFragmentsBySighash(getAbis());
    }

    return cachedFunctionFragmentsBySighash[sighash] ?? [];
};
