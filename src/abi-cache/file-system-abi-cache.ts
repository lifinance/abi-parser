import path from 'path'
import fs from 'fs'

import { AbiCache, AbiInformation } from './abi-cache'

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

                this.loadFromFile(filePath)
            })
    }

    protected override persist(key: string, abi: AbiInformation): void {
        const fileName = `${key}.json`

        fs.writeFileSync(path.resolve(this.abiDirectory, fileName), JSON.stringify(abi, undefined, 4))
    }
}
