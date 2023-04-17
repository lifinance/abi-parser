import { AbiCoder } from 'ethers'

import { hexify } from '../hexify'
import { CallDataInformation } from '../parameter-map'

import { STARGATE_PAYLOAD_ABI } from './abis/stargate'

export const parseStargate = (encodedCallData: string): Array<CallDataInformation> => {
    try {
        return [
            {
                functionName: 'unnamed (stargate)',
                rawCallData: encodedCallData,
                functionParameters: AbiCoder.defaultAbiCoder().decode(STARGATE_PAYLOAD_ABI, hexify(encodedCallData))
            } as CallDataInformation
        ]
    } catch (e) {
        return []
    }
}
