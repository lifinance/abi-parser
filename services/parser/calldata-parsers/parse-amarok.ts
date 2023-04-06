import { AbiCoder } from 'ethers'
import { AMAROK_PAYLOAD_ABI } from '../../abis/amarok'
import { CallDataInformation } from '../call-data-information'
import { hexify } from '../hexify'

export const parseAmarok = (encodedCallData: string): Array<CallDataInformation> => {
    try {
        return [
            {
                abiFileName: '',
                functionName: '',
                functionParameters: AbiCoder.defaultAbiCoder().decode(AMAROK_PAYLOAD_ABI, hexify(encodedCallData)),
            } as CallDataInformation,
        ]
    } catch (e) {
        return []
    }
}
