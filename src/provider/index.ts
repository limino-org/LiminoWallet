

export const errorCode = {
    "4001": {
        reason: "User Rejected Request",
        message: "The user rejected the request. "
    },
    "4100": {
        reason: "Unauthorized",
        message: "The requested method and/or account has not been authorized by the user. "
    },
    "4200": {
        reason: "Unsupported Method",
        message: "The Provider does not support the requested method. "
    },
    "4900": {
        reason: "Disconnected",
        message: "The Provider is disconnected from all chains."
    },
    "4901": {
        reason: "Chain Disconnected",
        message: "The Provider is not connected to the requested chain."
    }
}

export enum EventInfo {
    connect = "connect",
    disconnect = "disconnect",
    chainChanged = "chainChanged",
    accountsChanged = "accountsChanged",
    message = "message"
}

