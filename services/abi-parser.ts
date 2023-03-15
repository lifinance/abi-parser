import { BigNumber, ethers } from 'ethers';
import { getFunctionsBySighash } from './abi-loader';
import { ParamType, Result as EthersAbiResult } from '@ethersproject/abi';

export type ParameterValue = EthersAbiResult[keyof EthersAbiResult] | CallDataInformation;
export type ParameterMap = { [parameterName: string]: ParameterValue };
export type CallDataInformation = { abiFileName: string; functionName: string; functionParameters: ParameterMap };

export const isCalldataInformation = (value: unknown): value is CallDataInformation =>
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'abiFileName' in value &&
    'functionName' in value &&
    'functionParameters' in value;

const parseParameterValue = async (parameter: ParamType, decodedData: ParameterValue): Promise<ParameterValue> => {
    if (parameter.baseType === 'array' && parameter.arrayChildren && Array.isArray(decodedData)) {
        const result = [];
        for (const decodedEntry of decodedData) {
            result.push(await parseParameterValue(parameter.arrayChildren, decodedEntry));
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
    }

    if (parameter.baseType === 'tuple') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return buildParameterMap(parameter.components, decodedData);
    }

    if (BigNumber.isBigNumber(decodedData)) {
        return decodedData.toString();
    }

    if (typeof decodedData === 'string' && decodedData.startsWith('0x')) {
        const parsedCallDatas = await parseCallData(decodedData);
        if (parsedCallDatas.length > 0) {
            return parsedCallDatas;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return decodedData;
};

const buildParameterMap = async (parameters: Array<ParamType>, decodedData: EthersAbiResult) => {
    const parameterMap: ParameterMap = {};

    for (const parameter of parameters) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parameterMap[parameter.name] = await parseParameterValue(parameter, decodedData[parameter.name]);
    }

    return parameterMap;
};

export const parseCallData = async (encodedCallData: string) => {
    const hexCallData = encodedCallData.startsWith('0x') ? encodedCallData : `0x${encodedCallData}`;
    const callSighash = hexCallData.substring(0, 10); // function signature starts with 0x and has 4 bytes
    const callInputs = `0x${hexCallData.substring(10)}`;

    const functionFragments = getFunctionsBySighash(callSighash);
    const results: Array<CallDataInformation> = [];

    for (const { functionFragment, fileName } of functionFragments) {
        const decodedFunctionData = ethers.utils.defaultAbiCoder.decode(functionFragment.inputs, callInputs);
        const functionParameters = await buildParameterMap(functionFragment.inputs, decodedFunctionData);

        results.push({
            abiFileName: fileName,
            functionName: functionFragment.name,
            functionParameters,
        });
    }

    return results;
};
