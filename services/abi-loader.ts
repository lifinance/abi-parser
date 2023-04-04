import { dataSlice, FunctionFragment, id, Interface } from 'ethers'
import fs from 'fs'
import path from 'path'
import { Chain } from './chains/chain'
import { ChainConfig } from './chains/chain-config'
import { getAbi } from './chains/get-abi'

const ABI_DIRECTORY = path.resolve(__dirname, '../abis')

export type AbiInformation = { fileName: string; ethersInterface: Interface }
export type FunctionInformation = {
    fileName: string
    functionFragment: FunctionFragment
}

let cachedAbis: Array<AbiInformation> | undefined = undefined
let cachedFunctionFragmentsBySighash: { [sighash: string]: Array<FunctionInformation> } | undefined = undefined

export const cacheAbi = async (chains: Array<ChainConfig>, address: string): Promise<void> => {
    for (const chain of chains) {
        if (!isCached(address, chain.chain)) {
            const abi = await getAbi(chain, address)
            if (abi) {
                loadAbiFromString(address, abi, chain.chain)
            }
        }
    }
}

export const loadAbiFromString = (address: string, abi: string, chain: Chain) => {
    const ethersInterface = new Interface(abi)
    const fileName = `${address}-${chain.valueOf()}.json`

    cachedAbis?.push({ fileName, ethersInterface })

    fs.writeFileSync(path.resolve(ABI_DIRECTORY, fileName), JSON.stringify(JSON.parse(abi), undefined, 4))
    // fs.writeFileSync(path.resolve(ABI_DIRECTORY, fileName), abi);

    cachedFunctionFragmentsBySighash = groupFunctionFragmentsBySighash(getAbis())
}

export const isCached = (address: string, chain: Chain) => {
    if (cachedAbis) {
        for (const abi of cachedAbis) {
            if (abi.fileName === `${address}-${chain.valueOf()}.json`) {
                return true
            }
        }
    }

    return false
}

const loadAbisFromFileSystem = (): Array<AbiInformation> => {
    const filesPaths = fs.readdirSync(ABI_DIRECTORY)
    const abis: Array<AbiInformation> = []

    for (const fileName of filesPaths) {
        const filePath = path.resolve(ABI_DIRECTORY, fileName)

        if (path.extname(filePath) !== '.json') {
            console.warn(`unexpected file extension in abi folder: "${path.basename(filePath)}"`)
            continue
        }

        const fileContent = fs.readFileSync(filePath).toString()
        const ethersInterface = new Interface(fileContent)
        abis.push({ fileName, ethersInterface } as AbiInformation)
    }

    return abis
}

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
                functionFragment: functionFragment as FunctionFragment,
            })
        }
    }

    return functionFragmentsBySighash
}

export const getAbis = (): Array<AbiInformation> => {
    // cache loaded abis to prevent accessing file system after the first invocation
    if (!cachedAbis) {
        cachedAbis = loadAbisFromFileSystem()
    }

    return cachedAbis
}

export const getFunctionsBySighash = (sighash: string): Array<FunctionInformation> => {
    // cache grouped function fragments to prevent iterating over all fragments after the first invocation
    if (!cachedFunctionFragmentsBySighash) {
        cachedFunctionFragmentsBySighash = groupFunctionFragmentsBySighash(getAbis())
    }

    return cachedFunctionFragmentsBySighash[sighash] ?? []
}
