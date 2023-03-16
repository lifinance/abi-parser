import { AbiCoder, ParamType, Result } from 'ethers';
import { getFunctionsBySighash } from './abi-loader';
import { AMAROK_PAYLOAD_ABI } from './abis/amarok';
import { STARGATE_PAYLOAD_ABI } from './abis/stargate';

export type ParameterValue = Result[keyof Result] | CallDataInformation | BigInteger;
export type ParameterMap = { [parameterName: string]: ParameterValue };
export type CallDataInformation = { abiFileName: string; functionName: string; functionParameters: ParameterMap };

export const isCalldataInformation = (value: unknown): value is CallDataInformation =>
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'abiFileName' in value &&
    'functionName' in value &&
    'functionParameters' in value;

const parseParameterValue = (parameter: ParamType, decodedData: ParameterValue): ParameterValue => {
    if (parameter.baseType === 'array' && parameter.arrayChildren && Array.isArray(decodedData)) {
        const result = [];
        for (const decodedEntry of decodedData) {
            result.push(parseParameterValue(parameter.arrayChildren, decodedEntry));
        }

        return result;
    }

    if (parameter.baseType === 'tuple' && parameter.components !== null) {
        return buildParameterMap(parameter.components, decodedData);
    }

    if (typeof decodedData === 'bigint') {
        return decodedData.toString();
    }

    if (typeof decodedData === 'string' && decodedData.startsWith('0x')) {
        const parsedCallDatas = parseCallData(decodedData);
        if (parsedCallDatas.length > 0) {
            return parsedCallDatas;
        }
    }

    return decodedData;
};

const buildParameterMap = (parameters: ReadonlyArray<ParamType>, decodedData: Result) => {
    const parameterMap: ParameterMap = {};

    for (const parameter of parameters) {
        parameterMap[parameter.name] = parseParameterValue(parameter, decodedData[parameter.name]);
    }

    return parameterMap;
};

export const parseCallData = (encodedCallData: string): Array<CallDataInformation> => {
    const hexCallData = encodedCallData.startsWith('0x') ? encodedCallData : `0x${encodedCallData}`;
    const callSighash = hexCallData.substring(0, 10); // function signature starts with 0x and has 4 bytes
    const callInputs = `0x${hexCallData.substring(10)}`;

    const functionFragments = getFunctionsBySighash(callSighash);
    const results: Array<CallDataInformation> = [];

    for (const { functionFragment, fileName } of functionFragments) {
        try {
            const decodedFunctionData = AbiCoder.defaultAbiCoder().decode(functionFragment.inputs, callInputs);
            const functionParameters = buildParameterMap(functionFragment.inputs, decodedFunctionData);

            results.push({
                abiFileName: fileName,
                functionName: functionFragment.name,
                functionParameters,
            });
        } catch (e) {
            /* empty */
        }
    }

    if (results.length === 0) {
        const abis = [STARGATE_PAYLOAD_ABI, AMAROK_PAYLOAD_ABI];

        for (const abi of abis) {
            try {
                const decodedFunctionData = AbiCoder.defaultAbiCoder().decode(abi, hexCallData);
                results.push({
                    abiFileName: '',
                    functionName: '',
                    functionParameters: decodedFunctionData,
                });
            } catch (e) {
                /* empty */
            }
        }
    }

    return results;
};
