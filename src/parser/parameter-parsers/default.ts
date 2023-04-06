import { ParamType } from 'ethers'

import { parseAmarok, parseStargate } from '../calldata-parsers'
import { parseCallData } from '../calldata-parsers/parse-call-data'
import { ParameterValue } from '../parameter-map'

export const def = (_: ParamType, data: ParameterValue): ParameterValue => {
    const callDataParsers = [parseCallData, parseAmarok, parseStargate]

    if (typeof data === 'string' && data.startsWith('0x')) {
        for (const parse of callDataParsers) {
            const parsedData = parse(data)

            if (Array.isArray(parsedData) && parsedData.length > 0) {
                return parsedData
            }
        }
    }

    return data
}
