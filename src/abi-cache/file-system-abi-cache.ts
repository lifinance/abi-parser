import fs from 'fs'
import path from 'path'

import { stringify } from '../lib/stringify'

import { AbiCache, AbiInformation } from './abi-cache'

export class FileSystemAbiCache extends AbiCache {
  private readonly abiDirectory: string

  constructor(abiDirectory: string) {
    super()
    this.abiDirectory = abiDirectory || '/tmp/abi-parser'
  }

  public override init(): Promise<AbiCache> {
    this.loadAbiDirectory(this.abiDirectory)

    return Promise.resolve(this)
  }

  protected override persist(key: string, abi: AbiInformation): void {
    const fileName = `${key}.json`

    fs.writeFileSync(path.resolve(this.abiDirectory, fileName), stringify(abi))
  }
}
