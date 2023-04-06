export const hexify = (val: string): string => (val.startsWith('0x') ? val : `0x${val}`)
