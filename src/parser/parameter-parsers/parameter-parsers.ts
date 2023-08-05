import { ParamType } from 'ethers'

import { AbiCache } from '../../abi-cache/abi-cache'
import { ParameterValue } from '../parameter-map'

import { array } from './array'
import { defaultParser } from './default-parser'
import { tuple } from './tuple'

export const parameterParsers: {
  [baseType: string]: (
    param: ParamType,
    data: ParameterValue,
    cache: AbiCache
  ) => ParameterValue
} = {
  array,
  tuple,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uint256: (_, data, _cache) => data.toString(),
  defaultParser,
}
