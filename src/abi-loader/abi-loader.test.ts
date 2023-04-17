import { FunctionFragment, Interface } from 'ethers'

import { getAbis, getFunctionsBySighash } from './abi-loader'

describe('abi-loader', () => {
    it('load ABIs from the "abis" directory of the file system', () => {
        const abis = getAbis()

        expect(abis.length).toBeGreaterThanOrEqual(2)

        expect(abis[abis.length - 2].fileName).toBe('DiamondABI.json')
        expect(abis[abis.length - 2].ethersInterface).toBeInstanceOf(Interface)

        expect(abis[abis.length - 1].fileName).toBe('FeeCollectorABI.json')
        expect(abis[abis.length - 1].ethersInterface).toBeInstanceOf(Interface)
    })

    it('return a list of function fragments for the given sighash', () => {
        const functions = getFunctionsBySighash('0x612ad9cb')

        expect(functions).toHaveLength(1)

        expect(functions[0].fileName).toBe('DiamondABI.json')
        expect(functions[0].functionFragment).toBeInstanceOf(FunctionFragment)
        expect(functions[0].functionFragment.name).toBe('addressCanExecuteMethod')
    })

    it('return an empty list for a unknown sighash', () => {
        const functions = getFunctionsBySighash('0xa4baa10a')

        expect(functions).toHaveLength(0)
    })
})
