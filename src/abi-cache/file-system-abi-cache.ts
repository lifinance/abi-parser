import fs from 'fs'
import path from 'path'

import { AbiCache, AbiInformation } from './abi-cache'

export class FileSystemAbiCache extends AbiCache {
  private abiDirectory: string

  constructor(abiDirectory: string) {
    super()
    this.abiDirectory = abiDirectory || '/tmp/abi-parser'
    this.loadAbiDirectory(this.abiDirectory)
  }

  protected override persist(key: string, abi: AbiInformation): void {
    const fileName = `${key}.json`

    fs.writeFileSync(
      path.resolve(this.abiDirectory, fileName),
      JSON.stringify(abi, undefined, 4)
    )
  }
}
