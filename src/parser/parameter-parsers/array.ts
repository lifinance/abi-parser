import { ParamType } from 'ethers'

import { AbiCache } from '../../abi-cache/abi-cache'
import { ParameterValue } from '../parameter-map'
import { parseParameterValue } from '../parse-parameter-value'

export const array = (
  param: ParamType,
  data: ParameterValue,
  cache: AbiCache
): ParameterValue => {
  const children = param.arrayChildren as ParamType

  return Array.isArray(data)
    ? data.map((entry) => parseParameterValue(children, entry, cache))
    : undefined
}
