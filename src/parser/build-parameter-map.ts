import { ParamType, Result } from 'ethers'

import { AbiCache } from '../abi-cache/abi-cache'

import { ParameterMap, SwapDataStruct } from './parameter-map'
import { parseParameterValue } from './parse-parameter-value'

export const buildParameterMap = (
  parameters: ReadonlyArray<ParamType>,
  decodedData: Result,
  cache: AbiCache
): ParameterMap =>
  parameters.reduce((parameterMap: ParameterMap, parameter: ParamType) => {
    const decodedParameter = decodedData[parameter.name]

    if (decodedParameter !== undefined) {
      parameterMap[parameter.name] = parseParameterValue(
        parameter,
        decodedParameter,
        cache
      )
    }

    return parameterMap
  }, {})

export const listToSwapData = (list: unknown[]): SwapDataStruct => {
  if (!(list.length === 7))
    throw new Error('Cannot parse swap data. Incorrect amount of fields.')

  return {
    callTo: list[0],
    approveTo: list[1],
    sendingAssetId: list[2],
    receivingAssetId: list[3],
    fromAmount: (list[4] as bigint).toString(),
    callData: list[5],
    requiresDeposit: list[6],
  } as unknown as SwapDataStruct
}
