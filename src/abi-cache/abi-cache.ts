import { FunctionFragment, Interface, dataSlice, id } from 'ethers'
import fs from 'fs'
import path from 'path'

import { Chain } from '../chains'

export type AbiInformation = unknown[]
export type FunctionInformation = {
    functionFragment: FunctionFragment
}
type CachedFunctionFragmentsBySighash = { [sighash: string]: Array<FunctionInformation> }
export type ContractLocation = { address: string; chain: Chain }

export class AbiCache {
    protected cachedAbis: Map<string, Interface> = new Map()
    protected functionFragments: CachedFunctionFragmentsBySighash = {}

    constructor() {
        // DiamondABI
        const fileName = '0x9b11bc9fac17c058cab6286b0c785be6a65492ef-1.json'

        const filePath = path.join('./', fileName)

        this.loadFromFile(filePath)
    }

    private groupFunctionFragmentsBySighash = (): void => {
        this.functionFragments = {}
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

    protected loadFromFile(fileName: string): void {
        try {
            const fileContent = fs.readFileSync(fileName).toString()
            const ethersInterface = new Interface(fileContent)

            const location: ContractLocation = this.fromKey(path.basename(fileName, path.extname(fileName)))

            this.cachedAbis.set(this.toKey(location), ethersInterface)
            this.groupFunctionFragmentsBySighash()
        } catch (error) {
            console.error(`Error reading file ${fileName}: ${error}`)
        }
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

        this.cachedAbis.set(cacheKey, new Interface(JSON.stringify(abi)))
        this.persist(cacheKey, abi)
        this.groupFunctionFragmentsBySighash()
    }

    public get = (sighash: string): Array<FunctionInformation> => this.functionFragments[sighash] || []

    public has(location: ContractLocation): boolean {
        return this.cachedAbis.has(this.toKey(location))
    }
}
