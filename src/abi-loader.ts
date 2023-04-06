import { dataSlice, FunctionFragment, id, Interface } from 'ethers'
import fs from 'fs'
import path from 'path'

import { Chain, ChainConfig, getAbi } from './chains'

const ABI_DIRECTORY = path.resolve(__dirname, '../abis')

export type AbiInformation = { fileName: string; ethersInterface: Interface }
export type FunctionInformation = {
    fileName: string
    functionFragment: FunctionFragment
}

let cachedAbis: Array<AbiInformation> | undefined,
    cachedFunctionFragmentsBySighash: { [sighash: string]: Array<FunctionInformation> } | undefined

const groupFunctionFragmentsBySighash = (abis: Array<AbiInformation>) => {
    const functionFragmentsBySighash: typeof cachedFunctionFragmentsBySighash = {}

    for (const abi of abis) {
        for (const functionFragment of abi.ethersInterface.fragments.filter((f) => f.type === 'function')) {
            const functionSighash = dataSlice(id(functionFragment.format('sighash')), 0, 4)

            if (!(functionSighash in functionFragmentsBySighash)) {
                functionFragmentsBySighash[functionSighash] = []
            }

            functionFragmentsBySighash[functionSighash].push({
                ...abi,
                functionFragment: functionFragment as FunctionFragment
            })
        }
    }

    return functionFragmentsBySighash
}

const loadAbisFromFileSystem = (): Array<AbiInformation> => {
    const filesPaths = fs.readdirSync(ABI_DIRECTORY)

    return filesPaths
        .filter((fileName) => path.extname(fileName) === '.json')
        .map((fileName) => {
            const filePath = path.join(ABI_DIRECTORY, fileName)

            try {
                const fileContent = fs.readFileSync(filePath).toString()
                const ethersInterface = new Interface(fileContent)

                return { fileName, ethersInterface } as AbiInformation
            } catch (error) {
                console.error(`Error reading file ${filePath}: ${error}`)

                return null
            }
        })
        .filter(Boolean) as Array<AbiInformation>
}

export const getAbis = (): Array<AbiInformation> => {
    // cache loaded abis to prevent accessing file system after the first invocation
    if (!cachedAbis) {
        cachedAbis = loadAbisFromFileSystem()
    }

    return cachedAbis
}

export const loadAbiFromString = (address: string, abi: string, chain: Chain): void => {
    const ethersInterface = new Interface(abi)
    const fileName = `${address}-${chain.valueOf()}.json`

    cachedAbis?.push({ fileName, ethersInterface })

    fs.writeFileSync(path.resolve(ABI_DIRECTORY, fileName), JSON.stringify(JSON.parse(abi), undefined, 4))

    cachedFunctionFragmentsBySighash = groupFunctionFragmentsBySighash(getAbis())
}

export const isCached = (address: string, chain: Chain): boolean => {
    if (cachedAbis) {
        for (const abi of cachedAbis) {
            if (abi.fileName === `${address}-${chain.valueOf()}.json`) {
                return true
            }
        }
    }

    return false
}

export const cacheAbi = (chains: Array<ChainConfig>, address: string): Promise<void[]> =>
    Promise.all(
        chains.map(async (chain) => {
            if (!isCached(address, chain.chain)) {
                const abi = await getAbi(chain, address)

                if (abi) {
                    loadAbiFromString(address, abi, chain.chain)
                }
            }

            return Promise.resolve()
        })
    )

export const getFunctionsBySighash = (sighash: string): Array<FunctionInformation> => {
    // cache grouped function fragments to prevent iterating over all fragments after the first invocation
    if (!cachedFunctionFragmentsBySighash) {
        cachedFunctionFragmentsBySighash = groupFunctionFragmentsBySighash(getAbis())
    }

    return cachedFunctionFragmentsBySighash[sighash] ?? []
}
