import { ParamType } from 'ethers'

import { parseAmarok, parseStargate } from '../calldata-parsers'
import { parseCallData } from '../calldata-parsers/parse-call-data'
import { ParameterValue } from '../parameter-map'

export const defaultParser = (_: ParamType, data: ParameterValue): ParameterValue => {
    const callDataParsers = [parseCallData, parseAmarok, parseStargate]

    if (typeof data === 'string' && data.startsWith('0x')) {
        for (const parse of callDataParsers) {
            const parsedData = parse(data)

            // Parsers return an empty array if they fail to parse the data
            // First parser to succeed will return the parsed data
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                return parsedData
            }
        }
    }

    // We want to return the original data if all parsers failed
    return data
}
