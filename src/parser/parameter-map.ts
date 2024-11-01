import { Result } from 'ethers'

export type SwapDataStruct = {
  approveTo: string
  callData: CallDataInformation | string
  callTo: string
  fromAmount: BigInteger
  receivingAssetId: string
  requiresDeposit: boolean
  sendingAssetId: string
}
export type AmarokDataStruct = {
  callData: CallDataInformation | string
  callTo: string
  delegate: string
  relayerFee: BigInteger
  slippageTol: BigInteger
}
export type StargateDataStruct = {
  callData: CallDataInformation | string
  callTo: string
  dstGasForCall: BigInteger
  dstPoolId: BigInteger
  lzFee: BigInteger
  minAmountLD: BigInteger
  refundAddress: string
}

export type CallDataInformation = {
  functionName: string
  rawCallData?: string
  functionParameters: ParameterMap
}
export type ParameterValue =
  | Result[keyof Result]
  | CallDataInformation
  | BigInteger
  | string
export type ParameterMap = {
  [parameterName: string]: ParameterValue
  _swapData?: SwapDataStruct | Array<SwapDataStruct>
  _amarokData?: AmarokDataStruct
  _stargateData?: StargateDataStruct
}
