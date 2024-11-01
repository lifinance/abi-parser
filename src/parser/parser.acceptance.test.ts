import { AbiCoder } from 'ethers'
import { isStringObject } from 'util/types'

import { AbiCache, CacheType, initCache } from '../abi-cache'
import {
  bridge,
  bridgeSwap,
  collectTokenInsuranceFees,
  feeBridge,
  optimizedSwap,
  stargateSwap,
  swap,
  swapAmarokSwap,
  swapBridge,
} from '../testdata/encoded'

import { AMAROK_PAYLOAD_ABI } from './calldata-parsers/abis/amarok'
import { STARGATE_PAYLOAD_ABI } from './calldata-parsers/abis/stargate'
import { parseCallData } from './calldata-parsers/parse-call-data'
import {
  AmarokDataStruct,
  CallDataInformation,
  StargateDataStruct,
  SwapDataStruct,
} from './parameter-map'
import { listToSwapData } from './build-parameter-map'

const validateAndExtract = (
  results: CallDataInformation[]
): CallDataInformation => {
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
  'functionName' in value &&
  'functionParameters' in value

const validateAndExtractSwapData = (
  info: CallDataInformation
): Array<SwapDataStruct> => {
  expect(info.functionParameters._swapData).toBeDefined()

  return info.functionParameters._swapData as Array<SwapDataStruct>
}

let cache: AbiCache

describe('Acceptance tests', () => {
  beforeAll(async () => {
    cache = await initCache(CacheType.MEMORY)
  })

  it('should parse a swap transfer', () => {
    const results = parseCallData(swap, cache)
    const result = validateAndExtract(results)
    const swapData = validateAndExtractSwapData(result)
    const swapDataCalls = swapData.map((s) => s.callData).flat()

    expect(swapDataCalls).toBeDefined()
    expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
  })

  it('should parse a bridge transfer', () => {
    const results = parseCallData(bridge, cache)

    const information = validateAndExtract(results)

    expect(information).toBeDefined()
  })

  it('should parse a swap + bridge transfer', () => {
    const results = parseCallData(swapBridge, cache)
    const result = validateAndExtract(results)
    const swapData = validateAndExtractSwapData(result)
    const swapDataCalls = swapData.map((s) => s.callData).flat()

    expect(swapDataCalls).toBeDefined()
    expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should parse a swap(fee-collection) + bridge transfer', () => {
    const results = parseCallData(feeBridge, cache)
    const result = validateAndExtract(results)
    const swapData = validateAndExtractSwapData(result)
    const swapDataCalls = swapData.map((s) => s.callData).flat()

    expect(swapDataCalls).toBeDefined()
    expect(swapDataCalls.every(isCalldataInformation)).toBe(true)
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('bridge + swap transfer', () => {
    const results = parseCallData(bridgeSwap, cache)
    const result = validateAndExtract(results)

    const amarokData = result.functionParameters._amarokData as AmarokDataStruct

    expect(amarokData).toBeDefined()

    const [toolCallData] = amarokData.callData as CallDataInformation[]

    expect(toolCallData).toBeDefined()

    const rawCallData =
      '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000552008c0f6870c2f77e5cc1d2eb9bdff03e30ea0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000001b02da8cb0d097eb8d57a175b88c7d8b479975060000000000000000000000001b02da8cb0d097eb8d57a175b88c7d8b479975060000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000b3f868e0be5597d5db7feb59e1cadbb0fdda50a00000000000000000000000000000000000000000000000000000000000ec8b500000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010438ed173900000000000000000000000000000000000000000000000000000000000ec8b50000000000000000000000000000000000000000000000000ab39f39a4a41bd800000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000dd1305150d27aecc60c066630105db419977e367000000000000000000000000000000000000000000000000000000006411c21700000000000000000000000000000000000000000000000000000000000000020000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000b3f868e0be5597d5db7feb59e1cadbb0fdda50a00000000000000000000000000000000000000000000000000000000'
    const parsed = AbiCoder.defaultAbiCoder().decode(
      AMAROK_PAYLOAD_ABI,
      rawCallData
    )

    expect(toolCallData.functionParameters).toStrictEqual(parsed)
  })

  it('swap + stargate + swap transfer', () => {
    const results = parseCallData(stargateSwap, cache)
    const result = validateAndExtract(results)
    const stargateData = result.functionParameters
      ._stargateData as StargateDataStruct

    expect(stargateData).toBeDefined()

    const [toolCallData] = stargateData.callData as CallDataInformation[]

    expect(toolCallData).toBeDefined()

    const rawCallData =
      '0xe4062395cfea8e25cd957ffcec1fcad26d4007a21a7eedef7631ff6940ef48bf000000000000000000000000000000000000000000000000000000000000008000000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000552008c0f6870c2f77e5cc1d2eb9bdff03e30ea000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000d01319f4b65b79124549de409d36f25e04b3e551000000000000000000000000d01319f4b65b79124549de409d36f25e04b3e551000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000000000000001cf96c00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000010438ed173900000000000000000000000000000000000000000000000000000000001cf96c0000000000000000000000000000000000000000000000000003725db9f3984c00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000be27f03c8e6a61e2a4b1ee7940dbcb9204744d1c0000000000000000000000000000000000000000000000000000000064ca49e20000000000000000000000000000000000000000000000000000000000000002000000000000000000000000ff970a61a04b1ca14834a43f5de4533ebddb5cc800000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000000000000'
    const parsed = AbiCoder.defaultAbiCoder().decode(
      STARGATE_PAYLOAD_ABI,
      rawCallData
    )

    expect(toolCallData.functionParameters).toStrictEqual({
      transactionId: parsed[0],
      swaps: parsed[1].map(listToSwapData),
      assetId: parsed[2],
      receiver: parsed[3],
    })
  })

  it('swap + amarok + swap transfer', () => {
    const results = parseCallData(swapAmarokSwap, cache)
    const result = validateAndExtract(results)
    const amarokData = result.functionParameters._amarokData as AmarokDataStruct

    expect(amarokData).toBeDefined()

    const [toolCallData] = amarokData.callData as CallDataInformation[]

    expect(toolCallData).toBeDefined()

    const rawCallData =
      '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000044d51423298160e91492da091acd9acd6697bab0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000010ed43c718714eb63d5aa57b78b54704e256024e00000000000000000000000010ed43c718714eb63d5aa57b78b54704e256024e0000000000000000000000001af3f329e8be154074d8769d1ffa4ee058b1dbc300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f176bfca6293ced00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000010418cbafe50000000000000000000000000000000000000000000000000f176bfca6293ced000000000000000000000000000000000000000000000000000fb29df7ac71a000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000be27f03c8e6a61e2a4b1ee7940dbcb9204744d1c0000000000000000000000000000000000000000000000000000000064c92b7700000000000000000000000000000000000000000000000000000000000000020000000000000000000000001af3f329e8be154074d8769d1ffa4ee058b1dbc3000000000000000000000000bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c00000000000000000000000000000000000000000000000000000000'
    const parsed = AbiCoder.defaultAbiCoder().decode(
      AMAROK_PAYLOAD_ABI,
      rawCallData
    )

    expect(toolCallData.functionParameters).toStrictEqual({
      swaps: parsed[0].map(listToSwapData),
      receiver: parsed[1],
    })
  })

  it('parse advanced swap functions', () => {
    const results = parseCallData(optimizedSwap, cache)
    const result = validateAndExtract(results)

    expect(result.functionName).toBe('swapTokensSingleV3ERC20ToNative')
  })

  it('parse swap calldata: collectTokenInsuranceFees', () => {
    const results = parseCallData(collectTokenInsuranceFees, cache)
    const result = validateAndExtract(results)

    expect(result.functionParameters._swapData).toHaveLength(1)

    if (!result.functionParameters._swapData) return

    // checking that callData was parsed as well and is only included once
    const [swapData] = result.functionParameters._swapData

    expect(swapData.callData).toHaveLength(1)

    if (isStringObject(swapData.callData)) return

    expect(swapData.callData[0].functionName).toBe('collectTokenInsuranceFees')
  })
})
