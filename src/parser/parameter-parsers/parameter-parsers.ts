import { ParamType } from 'ethers'

import { ParameterValue } from '../parameter-map'

import { array } from './array'
import { defaultParser } from './default-parser'
import { tuple } from './tuple'

export const parameterParsers: { [baseType: string]: (param: ParamType, data: ParameterValue) => ParameterValue } = {
    array,
    tuple,
    uint256: (_, data) => data.toString(),
    defaultParser
}
