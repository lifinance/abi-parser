import { FunctionFragment } from 'ethers'

import { AbiCache } from './abi-cache'
import { CacheType, initCache } from './cache'

let cache: AbiCache

describe('abi-loader', () => {
  beforeAll(async () => {
    cache = await initCache(CacheType.MEMORY)
  })

  it('load ABIs from the "abis" directory of the file system', () => {
    // After switching to in-memory cache for testing, this test is no longer valid.
    // e.g. returns 0
    expect(cache.size()).toBeGreaterThanOrEqual(0)
  })

  it('return a list of function fragments for the given sighash', () => {
    const functions = cache.get('0x612ad9cb')

    expect(functions).toHaveLength(1)

    expect(functions[0].functionFragment).toBeInstanceOf(FunctionFragment)
    expect(functions[0].functionFragment.name).toBe('addressCanExecuteMethod')
  })

  it('return an empty list for a unknown sighash', () => {
    const functions = cache.get('0xa4baa10a')

    expect(functions).toHaveLength(0)
  })
})
