import { ParamType } from 'ethers'

import { AbiCache } from '../../abi-cache/abi-cache'
import { buildParameterMap } from '../build-parameter-map'
import { ParameterMap, ParameterValue } from '../parameter-map'

export const tuple = (
  param: ParamType,
  data: ParameterValue,
  cache: AbiCache
): ParameterMap | undefined => {
  const { components } = param

  return components ? buildParameterMap(components, data, cache) : undefined
}
