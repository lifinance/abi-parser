import { ParamType } from 'ethers'
import { buildParameterMap } from '../build-parameter-map'
import { ParameterValue } from '../parameter-map'

export const tuple = (param: ParamType, data: ParameterValue) => {
    const components = param.components
    return components ? buildParameterMap(components, data) : undefined
}
