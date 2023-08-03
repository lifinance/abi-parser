import { AbiCoder } from 'ethers'

import { buildParameterMap } from '../build-parameter-map'
import { hexify } from '../hexify'
import { CallDataInformation } from '../parameter-map'
import { cache } from '../../abi-cache/cache'

export const parseCallData = (
  encodedCallData: string
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
      decodedFunctionData
    )

    return {
      functionName: functionFragment.name,
      functionParameters,
    }
  })
}
