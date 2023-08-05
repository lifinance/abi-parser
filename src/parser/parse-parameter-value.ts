import { ParamType } from 'ethers'

import { AbiCache } from '../abi-cache/abi-cache'

import { ParameterValue } from './parameter-map'
import { parameterParser } from './parameter-parsers'

export const parseParameterValue = (
  parameter: ParamType,
  decodedData: ParameterValue,
  cache: AbiCache
): ParameterValue => {
  const parse = parameterParser(parameter.baseType)

  return parse(parameter, decodedData, cache)
}
