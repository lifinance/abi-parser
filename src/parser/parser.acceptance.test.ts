import { AbiCoder } from 'ethers'

import { CacheType, initCache } from '../abi-cache/cache'
import { patchBigint } from '../bigint/patch-bigint'
import { bridge, bridgeSwap, feeBridge, stargateSwap, swap, swapBridge } from '../testdata/encoded'

import { AMAROK_PAYLOAD_ABI } from './calldata-parsers/abis/amarok'
import { STARGATE_PAYLOAD_ABI } from './calldata-parsers/abis/stargate'
import { parseCallData } from './calldata-parsers/parse-call-data'
import { AmarokDataStruct, CallDataInformation, StargateDataStruct, SwapDataStruct } from './parameter-map'

const validateAndExtract = (results: CallDataInformation[]): CallDataInformation => {
    expect(results).toBeDefined()
    expect(results).toHaveLength(1)

    const [result] = results

    expect(result).toBeDefined()
    expect(result.functionName).toBeDefined()
    expect(result.functionParameters).toBeDefined()

    return result
}

const isCalldataInformation = (value: unknown): value is CallDataInformation =>
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'abiFileName' in value &&
    'functionName' in value &&
    'functionParameters' in value

const validateAndExtractSwapData = (info: CallDataInformation): Array<SwapDataStruct> => {
    expect(info.functionParameters._swapData).toBeDefined()

    return info.functionParameters._swapData as Array<SwapDataStruct>
}

describe('Acceptance tests', () => {
    beforeAll(() => initCache(CacheType.MEMORY))

    beforeEach(() => patchBigint())

    it('should parse a swap transfer', () => {
        const results = parseCallData(swap)
        const result = validateAndExtract(results)
        const swapData = validateAndExtractSwapData(result)
        const swapDataCalls = swapData.map((s) => s.callData).flat()

        expect(swapDataCalls).toBeDefined()
        expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
    })

    it('should parse a bridge transfer', () => {
        const results = parseCallData(bridge)

        const information = validateAndExtract(results)

        expect(information).toBeDefined()
    })

    it('should parse a swap + bridge transfer', () => {
        const results = parseCallData(swapBridge)
        const result = validateAndExtract(results)
        const swapData = validateAndExtractSwapData(result)
        const swapDataCalls = swapData.map((s) => s.callData).flat()

        expect(swapDataCalls).toBeDefined()
        expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
    })

    it('should parse a swap(fee-collection) + bridge transfer', () => {
        const results = parseCallData(feeBridge)
        const result = validateAndExtract(results)
        const swapData = validateAndExtractSwapData(result)
        const swapDataCalls = swapData.map((s) => s.callData).flat()

        expect(swapDataCalls).toBeDefined()
        expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
    })

    it('bridge + swap transfer', () => {
        const results = parseCallData(bridgeSwap)
        const result = validateAndExtract(results)

        const amarokData = result.functionParameters._amarokData as AmarokDataStruct

        expect(amarokData).toBeDefined()

        const [toolCallData] = amarokData.callData as CallDataInformation[]

        expect(toolCallData).toBeDefined()

        const rawCallData =
            '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000552008c0f6870c2f77e5cc1d2eb9bdff03e30ea0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000001b02da8cb0d097eb8d57a175b88c7d8b479975060000000000000000000000001b02da8cb0d097eb8d57a175b88c7d8b479975060000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000b3f868e0be5597d5db7feb59e1cadbb0fdda50a00000000000000000000000000000000000000000000000000000000000ec8b500000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010438ed173900000000000000000000000000000000000000000000000000000000000ec8b50000000000000000000000000000000000000000000000000ab39f39a4a41bd800000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000dd1305150d27aecc60c066630105db419977e367000000000000000000000000000000000000000000000000000000006411c21700000000000000000000000000000000000000000000000000000000000000020000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000b3f868e0be5597d5db7feb59e1cadbb0fdda50a00000000000000000000000000000000000000000000000000000000'
        const parsed = AbiCoder.defaultAbiCoder().decode(AMAROK_PAYLOAD_ABI, rawCallData)

        expect(toolCallData.functionParameters).toStrictEqual(parsed)
    })

    it('swap + stargate + swap transfer', () => {
        const results = parseCallData(stargateSwap)
        const result = validateAndExtract(results)
        const stargateData = result.functionParameters._stargateData as StargateDataStruct

        expect(stargateData).toBeDefined()

        const [toolCallData] = stargateData.callData as CallDataInformation[]

        expect(toolCallData).toBeDefined()

        const rawCallData =
            '0xf11143cd9f9cd364ee12da262c7259e1aee2ee47caa365922271f24d5ee48f53000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008e9b6389d837abca0bbe3e50cd47489a0deeea8d000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000001111111254eeb25477b68fb85ed929f73a9605820000000000000000000000001111111254eeb25477b68fb85ed929f73a96058200000000000000000000000004068da6c83afcfa0e13ba15a6696662335d5b75000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001238d900000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034812aa3caf0000000000000000000000005d0ec1f843c1233d304b96dbde0cab9ec04d71ef00000000000000000000000004068da6c83afcfa0e13ba15a6696662335d5b75000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000005d0ec1f843c1233d304b96dbde0cab9ec04d71ef000000000000000000000000dd1305150d27aecc60c066630105db419977e36700000000000000000000000000000000000000000000000000000000001238d900000000000000000000000000000000000000000000000023ba83c51c676b0f000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000001a200018c0001505126a38cd27185a464914d3046f0ab9d43356b34829d04068da6c83afcfa0e13ba15a6696662335d5b750004f41766d80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000238c8d6635fd693c00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000005d0ec1f843c1233d304b96dbde0cab9ec04d71ef00000000000000000000000000000000000000000000000000000000641af5b8000000000000000000000000000000000000000000000000000000000000000100000000000000000000000004068da6c83afcfa0e13ba15a6696662335d5b7500000000000000000000000021be370d5312f44cb42ce377bc9b8a0cef1a4c830000000000000000000000000000000000000000000000000000000000000001410121be370d5312f44cb42ce377bc9b8a0cef1a4c8300042e1a7d4d0000000000000000000000000000000000000000000000000000000000000000c0611111111254eeb25477b68fb85ed929f73a9605822e9b3012000000000000000000000000000000000000000000000000'
        const parsed = AbiCoder.defaultAbiCoder().decode(STARGATE_PAYLOAD_ABI, rawCallData)

        expect(toolCallData.functionParameters).toStrictEqual(parsed)
    })
})
