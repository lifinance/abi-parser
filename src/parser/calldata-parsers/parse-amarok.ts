import { AbiCoder } from 'ethers'

import { stringify } from '../../lib/stringify'
import { hexify } from '../hexify'
import { CallDataInformation } from '../parameter-map'

import { AMAROK_PAYLOAD_ABI } from './abis/amarok'

export const parseAmarok = (
  encodedCallData: string
): Array<CallDataInformation> => {
  try {
    const functionParameters = AbiCoder.defaultAbiCoder().decode(
      AMAROK_PAYLOAD_ABI,
      hexify(encodedCallData)
    )

    // For currently unknown reason, `decode` sometimes returns an object where accessing the first element fails
    // This is a workaround for that
    try {
      const [xxx] = functionParameters

      if (!xxx) {
        console.log('never gonna happen')
      }
    } catch (e) {
      return []
    }

    return [
      {
        functionName: 'unnamed (amarok)',
        rawCallData: encodedCallData,
        functionParameters,
      } as CallDataInformation,
    ]
  } catch (e) {
    return []
  }
}
