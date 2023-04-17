import path from 'path'
import fs from 'fs'
import { Interface } from 'ethers'

import { AbiCache, AbiInformation, ContractLocation } from './abi-cache'

export class FileSystemAbiCache extends AbiCache {
    private abiDirectory: string

    constructor(abiDirectory: string) {
        super()
        this.abiDirectory = abiDirectory
        const filesPaths = fs.readdirSync(this.abiDirectory)

        filesPaths
            .filter((fileName) => path.extname(fileName) === '.json')
            .forEach((fileName) => {
                const filePath = path.join(this.abiDirectory, fileName)

                try {
                    const fileContent = fs.readFileSync(filePath).toString()
                    const ethersInterface = new Interface(fileContent)

                    const location: ContractLocation = this.fromKey(fileName.replace('.json', ''))

                    this.cachedAbis.set(this.toKey(location), ethersInterface)
                    this.groupFunctionFragmentsBySighash()
                } catch (error) {
                    console.error(`Error reading file ${filePath}: ${error}`)
                }
            })
    }

    protected override persist(key: string, abi: AbiInformation): void {
        const fileName = `${key}.json`

        fs.writeFileSync(path.resolve(this.abiDirectory, fileName), JSON.stringify(abi, undefined, 4))
    }
}
