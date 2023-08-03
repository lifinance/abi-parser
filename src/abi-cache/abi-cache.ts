import { ChainId } from '@lifi/types'
import { dataSlice, FunctionFragment, id, Interface } from 'ethers'
import fs from 'fs'
import path from 'path'

export type AbiInformation = unknown[]
export type FunctionInformation = {
  functionFragment: FunctionFragment
}
type CachedFunctionFragmentsBySighash = {
  [sighash: string]: Array<FunctionInformation>
}
export type ContractLocation = { address: string; chain: ChainId }

export class AbiCache {
  protected cachedAbis: Map<string, Interface> = new Map()
  protected functionFragments: CachedFunctionFragmentsBySighash = {}

  constructor() {
    // Load shipped ABIs
    this.loadAbiDirectory(path.join(__dirname, '../../abis'))
  }

  private groupFunctionFragmentsBySighash = (): void => {
    this.functionFragments = {}
    for (const abi of this.cachedAbis.values()) {
      for (const functionFragment of abi.fragments.filter(
        (f) => f.type === 'function'
      )) {
        const functionSighash = dataSlice(
          id(functionFragment.format('sighash')),
          0,
          4
        )

        if (!(functionSighash in this.functionFragments)) {
          this.functionFragments[functionSighash] = []
        }

        this.functionFragments[functionSighash].push({
          ...abi,
          functionFragment: functionFragment as FunctionFragment,
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

  protected loadAbiDirectory(abiDirectory: string): void {
    if (!fs.existsSync(abiDirectory)) {
      fs.mkdirSync(abiDirectory)
    }
    const filesPaths = fs.readdirSync(abiDirectory)

    filesPaths
      .filter((fileName) => path.extname(fileName) === '.json')
      .forEach((fileName) => {
        const filePath = path.join(abiDirectory, fileName)

        this.loadFromFile(filePath)
      })
  }

  protected loadFromFile(fileName: string): void {
    try {
      const fileContent = fs.readFileSync(fileName).toString()
      const ethersInterface = new Interface(fileContent)

      const location: ContractLocation = this.fromKey(
        path.basename(fileName, path.extname(fileName))
      )

      this.cachedAbis.set(this.toKey(location), ethersInterface)
      this.groupFunctionFragmentsBySighash()
    } catch (error) {
      console.error(`Error reading file ${fileName}: ${error}`)
    }
  }

  protected fromKey(key: string): ContractLocation {
    // Address and ChainId information is encoded in the file name
    // e.g. 0x9b11bc9fac17c058cab6286b0c785be6a65492ef-1.json
    // RegEx need to match to be able to decode the information
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

    if (!(chainId in ChainId)) {
      throw new Error(`Invalid enum value in input string: ${chainString}`)
    }

    const chain = ChainId[ChainId[chainId] as keyof typeof ChainId]

    return {
      address,
      chain,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  protected persist(_key: string, _abi: AbiInformation): void {}

  public set = (location: ContractLocation, abi: AbiInformation): void => {
    const cacheKey = this.toKey(location)

    this.cachedAbis.set(cacheKey, new Interface(JSON.stringify(abi)))
    this.persist(cacheKey, abi)
    this.groupFunctionFragmentsBySighash()
  }

  public get = (sighash: string): Array<FunctionInformation> =>
    this.functionFragments[sighash] || []

  public has(location: ContractLocation): boolean {
    return this.cachedAbis.has(this.toKey(location))
  }
}
