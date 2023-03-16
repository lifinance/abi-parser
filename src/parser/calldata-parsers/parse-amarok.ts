import { AbiCoder } from 'ethers'

import { hexify } from '../hexify'
import { CallDataInformation } from '../parameter-map'

import { AMAROK_PAYLOAD_ABI } from './abis/amarok'

export const parseAmarok = (encodedCallData: string): Array<CallDataInformation> => {
    try {
        return [
            {
                abiFileName: '',
                functionName: '',
                functionParameters: AbiCoder.defaultAbiCoder().decode(AMAROK_PAYLOAD_ABI, hexify(encodedCallData))
            } as CallDataInformation
        ]
    } catch (e) {
        return []
    }
}
