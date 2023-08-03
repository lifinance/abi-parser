import { ParamType } from 'ethers'

import { ParameterValue } from './parameter-map'
import { parameterParser } from './parameter-parsers'

export const parseParameterValue = (
  parameter: ParamType,
  decodedData: ParameterValue
): ParameterValue => {
  const parse = parameterParser(parameter.baseType)

  return parse(parameter, decodedData)
}
