import { ParamType } from 'ethers'

import { ParameterValue } from '../parameter-map'

import { parameterParsers } from './parameter-parsers'

export type ParameterParser = (
  param: ParamType,
  data: ParameterValue
) => ParameterValue
export const parameterParser = (type: string): ParameterParser =>
  parameterParsers[type] || parameterParsers.defaultParser
