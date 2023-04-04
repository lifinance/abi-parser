export const STARGATE_PAYLOAD_ABI = [
    'uint256', // Transaction Id
    'tuple(address callTo, address approveTo, address sendingAssetId, address receivingAssetId, uint256 fromAmount, bytes callData, bool requiresDeposit)[]', // Swap Data
    'address', // Asset Id
    'address', // Receiver
]
