/* eslint-disable */
// @ts-ignore
export const patchBigint = (): (() => string) => ((BigInt.prototype as any).toJSON = () => this.toString())
/* eslint-enable */
