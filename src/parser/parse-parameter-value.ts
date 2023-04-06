import { ParamType } from 'ethers'

import { ParameterValue } from './parameter-map'
import { parameterParser } from './parameter-parsers/parameter-parser'

export const parseParameterValue = (parameter: ParamType, decodedData: ParameterValue): ParameterValue => {
    const parse = parameterParser(parameter.baseType)

    return parse(parameter, decodedData)
}
