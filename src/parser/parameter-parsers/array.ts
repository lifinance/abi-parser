import { ParamType } from 'ethers'

import { ParameterValue } from '../parameter-map'
import { parseParameterValue } from '../parse-parameter-value'

export const array = (
  param: ParamType,
  data: ParameterValue
): ParameterValue => {
  const children = param.arrayChildren as ParamType

  return Array.isArray(data)
    ? data.map((entry) => parseParameterValue(children, entry))
    : undefined
}
