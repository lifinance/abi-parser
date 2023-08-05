import { AbiCoder } from 'ethers'

import { AbiCache } from '../../abi-cache/abi-cache'
import { buildParameterMap } from '../build-parameter-map'
import { hexify } from '../hexify'
import { CallDataInformation } from '../parameter-map'

export const parseCallData = (
  encodedCallData: string,
  cache: AbiCache
): CallDataInformation[] => {
  const hexCallData = hexify(encodedCallData)
  const callSighash = hexCallData.substring(0, 10)
  const callInputs = `0x${hexCallData.substring(10)}`

  const functionFragments = cache.get(callSighash)

  return functionFragments.map(({ functionFragment }) => {
    const decodedFunctionData = AbiCoder.defaultAbiCoder().decode(
      functionFragment.inputs,
      callInputs
    )
    const functionParameters = buildParameterMap(
      functionFragment.inputs,
      decodedFunctionData,
      cache
    )

    return {
      functionName: functionFragment.name,
      functionParameters,
    }
  })
}
