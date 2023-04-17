import { FunctionFragment } from 'ethers'

import { cache, initCache } from './cache'

describe('abi-loader', () => {
  beforeAll(() => {
    initCache()
  })

  it('load ABIs from the "abis" directory of the file system', () => {
    expect(cache.size()).toBeGreaterThanOrEqual(2)
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
