import { ParamType } from 'ethers'
import { ParameterValue } from '../parameter-map'
import { array } from './array'
import { def } from './default'
import { tuple } from './tuple'

const parameterParsers: { [baseType: string]: (param: ParamType, data: ParameterValue) => ParameterValue } = {
    array,
    tuple,
    uint256: (param, data) => data.toString(),
    def,
}

export const parameterParser = (type: string) => parameterParsers[type] || parameterParsers.def
