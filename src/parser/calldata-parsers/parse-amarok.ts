import { AbiCoder } from 'ethers'

import { log } from '../../lib/logger'
import { hexify } from '../hexify'
import { CallDataInformation } from '../parameter-map'
import { listToSwapData } from '..'

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
        log().error('never gonna happen')
      }
    } catch (e) {
      return []
    }

    // Parser results in many false positives, so we need to filter them out
    // TODO: This is a hack, we should be able to do better
    // For example, we could define a type analogous to AMAROK_PAYLOAD_ABI
    // and use that to validate the decoded parameters

    if (functionParameters[0][0].length !== 7) {
      return []
    }

    // We know that amaroks first param is a list of SwapData[] so we can treat it as such
    const swapDatas = functionParameters[0].map(listToSwapData)
    const receiver = functionParameters[1] as string
    const massagedFunctionParams = {
      swaps: swapDatas,
      receiver,
    }

    return [
      {
        functionName: 'unnamed (amarok)',
        rawCallData: encodedCallData,
        functionParameters: massagedFunctionParams,
      } as CallDataInformation,
    ]
  } catch (e) {
    return []
  }
}
