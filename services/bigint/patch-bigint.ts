export const patchBigint = () =>
    ((BigInt.prototype as any).toJSON = function () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
        return this.toString();
    });
