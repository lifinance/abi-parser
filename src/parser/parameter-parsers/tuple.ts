import { ParamType } from 'ethers'

import { buildParameterMap } from '../build-parameter-map'
import { ParameterMap, ParameterValue } from '../parameter-map'

export const tuple = (param: ParamType, data: ParameterValue): ParameterMap | undefined => {
    const { components } = param

    return components ? buildParameterMap(components, data) : undefined
}
