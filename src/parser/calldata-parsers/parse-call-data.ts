import { AbiCoder } from 'ethers'

import { getFunctionsBySighash } from '../../abi-loader'
import { buildParameterMap } from '../build-parameter-map'
import { hexify } from '../hexify'
import { CallDataInformation } from '../parameter-map'

export const parseCallData = (encodedCallData: string): CallDataInformation[] => {
    const hexCallData = hexify(encodedCallData)
    const callSighash = hexCallData.substring(0, 10)
    const callInputs = `0x${hexCallData.substring(10)}`

    const functionFragments = getFunctionsBySighash(callSighash)

    return functionFragments.map(({ functionFragment, fileName }) => {
        const decodedFunctionData = AbiCoder.defaultAbiCoder().decode(functionFragment.inputs, callInputs)
        const functionParameters = buildParameterMap(functionFragment.inputs, decodedFunctionData)

        return {
            abiFileName: fileName,
            functionName: functionFragment.name,
            functionParameters
        }
    })
}
