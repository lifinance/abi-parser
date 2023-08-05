import { ParamType, Result } from 'ethers'

import { AbiCache } from '../abi-cache/abi-cache'

import { ParameterMap } from './parameter-map'
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
