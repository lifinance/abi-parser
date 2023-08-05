import { ParamType } from 'ethers'

import { AbiCache } from '../../abi-cache/abi-cache'
import { ParameterValue } from '../parameter-map'

import { parameterParsers } from './parameter-parsers'

export type ParameterParser = (
  param: ParamType,
  data: ParameterValue,
  cache: AbiCache
) => ParameterValue
export const parameterParser = (type: string): ParameterParser =>
  parameterParsers[type] || parameterParsers.defaultParser
