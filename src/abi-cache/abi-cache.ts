import { FunctionFragment, Interface, dataSlice, id } from 'ethers'

import { Chain } from '../chains'

export type AbiInformation = Interface
export type FunctionInformation = {
    functionFragment: FunctionFragment
}
type CachedFunctionFragmentsBySighash = { [sighash: string]: Array<FunctionInformation> }
export type ContractLocation = { address: string; chain: Chain }

export class AbiCache {
    protected cachedAbis: Map<string, AbiInformation> = new Map()
    protected functionFragments: CachedFunctionFragmentsBySighash = {}

    groupFunctionFragmentsBySighash = (): void => {
        for (const abi of this.cachedAbis.values()) {
            for (const functionFragment of abi.fragments.filter((f) => f.type === 'function')) {
                const functionSighash = dataSlice(id(functionFragment.format('sighash')), 0, 4)

                if (!(functionSighash in this.functionFragments)) {
                    this.functionFragments[functionSighash] = []
                }

                this.functionFragments[functionSighash].push({
                    ...abi,
                    functionFragment: functionFragment as FunctionFragment
                })
            }
        }
    }

    public size(): number {
        return Object.keys(this.cachedAbis).length
    }

    protected toKey(location: ContractLocation): string {
        return `${location.address}-${location.chain.valueOf()}`
    }

    protected fromKey(key: string): ContractLocation {
        const regex = /^(0x[a-fA-F0-9]+)-(\d+)$/
        const match = key.match(regex)

        if (match === null) {
            throw new Error('Invalid input string')
        }

        const [_, address, chainString] = match
        const chainId = parseInt(chainString, 10)

        // Handle errors if parsing fails
        if (isNaN(chainId)) {
            throw new Error('Invalid number in input string')
        }

        if (!(chainId in Chain)) {
            throw new Error(`Invalid enum value in input string: ${chainString}`)
        }

        const chain = Chain[Chain[chainId] as keyof typeof Chain]

        return {
            address,
            chain
        } as ContractLocation
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    protected persist(_key: string, _abi: AbiInformation): void {}

    public set = (location: ContractLocation, abi: AbiInformation): void => {
        // const ethersInterface = new Interface(abi)

        const cacheKey = this.toKey(location)

        this.cachedAbis.set(cacheKey, abi)
        this.persist(cacheKey, abi)
        this.groupFunctionFragmentsBySighash()
    }

    public get = (sighash: string): Array<FunctionInformation> => this.functionFragments[sighash] || []

    public has(location: ContractLocation): boolean {
        return this.cachedAbis.has(this.toKey(location))
    }
}
