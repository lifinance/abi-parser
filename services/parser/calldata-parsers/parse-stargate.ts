import { AbiCoder } from 'ethers'
import { STARGATE_PAYLOAD_ABI } from '../../abis/stargate'
import { CallDataInformation } from '../call-data-information'
import { hexify } from '../hexify'

export const parseStargate = (encodedCallData: string): Array<CallDataInformation> => {
    try {
        return [
            {
                abiFileName: '',
                functionName: '',
                functionParameters: AbiCoder.defaultAbiCoder().decode(STARGATE_PAYLOAD_ABI, hexify(encodedCallData)),
            } as CallDataInformation,
        ]
    } catch (e) {
        return []
    }
}
