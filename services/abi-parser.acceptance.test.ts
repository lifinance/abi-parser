import { ethers } from 'ethers';
import { parseCallData, CallDataInformation, ParameterValue, isCalldataInformation } from './abi-parser';
import { swap, bridge, bridgeSwap, swapBridge, feeBridge } from './testdata/encoded';

const validateAndExtract = (results: CallDataInformation[]): CallDataInformation => {
    expect(results).toBeDefined()
    expect(results.length).toBe(1)
    const result = results[0]
    expect(result).toBeDefined()
    expect(result.abiFileName).toBeDefined()
    expect(result.functionName).toBeDefined()
    expect(result.functionParameters).toBeDefined()
    return result
}

const validateAndExtractSwapData = (result: CallDataInformation): ParameterValue[]  => {
    expect(result.functionParameters._swapData).toBeDefined()
    const swapData = result.functionParameters._swapData
    expect(swapData).toBeDefined()
    return swapData
}

describe('Acceptance tests', () => {
    it('should parse a swap transfer', async () => {
        const results = await parseCallData(swap)
        const result = validateAndExtract(results)
        const swapData = validateAndExtractSwapData(result)
        const swapDataCalls = swapData.flatMap(s => s.callData)
        expect(swapDataCalls).toBeDefined()
        expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
    })

    it('should parse a bridge transfer', async () => {
        const results = await parseCallData(bridge)
        validateAndExtract(results)
    })

    it('should parse a swap + bridge transfer', async () => {
        const results = await parseCallData(swapBridge)
        const result = validateAndExtract(results)
        const swapData = validateAndExtractSwapData(result)
        const swapDataCalls = swapData.flatMap(s => s.callData)
        expect(swapDataCalls).toBeDefined()
        expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
    })

    it('should parse a swap(fee-collection) + bridge transfer', async () => {
        const results = await parseCallData(feeBridge)
        const result = validateAndExtract(results)
        const swapData = validateAndExtractSwapData(result)
        const swapDataCalls = swapData.flatMap(s => s.callData)
        expect(swapDataCalls).toBeDefined()
        expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
    })

    it('bridge + swap transfer', async () => {
        const results = await parseCallData(bridgeSwap)
        const result = validateAndExtract(results)
        const amarokData = result.functionParameters._amarokData
        expect(amarokData).toBeDefined()
        const toolCallData = amarokData.callData
        expect(toolCallData).toBeDefined()
        const AMAROK_PAYLOAD_ABI = [
            'tuple(address callTo, address approveTo, address sendingAssetId, address receivingAssetId, uint256 fromAmount, bytes callData, bool requiresDeposit)[]', // Swap Data
            'address', // Receiver
        ]
        const parsed = ethers.utils.defaultAbiCoder.decode(AMAROK_PAYLOAD_ABI, toolCallData)
        expect(toolCallData).toEqual(parsed)
    })
})