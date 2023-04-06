import { Result } from 'ethers'
import { AmarokFacet, StargateFacet } from 'lifi-contract-types'
import { LibSwap } from 'lifi-contract-types/dist/IExecutor'
import { CallDataInformation } from './call-data-information'

export type ParameterValue = Result[keyof Result] | CallDataInformation | BigInteger | string
export type ParameterMap = {
    [parameterName: string]: ParameterValue
    _swapData?: Array<LibSwap.SwapDataStruct>
    _amarokData?: AmarokFacet.AmarokDataStruct
    _stargateData?: StargateFacet.StargateDataStruct
}
