// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const patchBigint = (): (() => string) => ((BigInt.prototype as any).toJSON = () => this.toString())
