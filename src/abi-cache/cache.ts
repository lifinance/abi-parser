import { AbiCache } from './abi-cache'
import { FileSystemAbiCache } from './file-system-abi-cache'

export let cache: AbiCache

export const initCache = (): AbiCache => {
    if (cache === undefined) {
        cache = new FileSystemAbiCache(process.env.ABI_DIRECTORY ?? './abis')
    }

    return cache
}
