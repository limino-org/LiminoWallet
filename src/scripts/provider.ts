//   error code
export const errorCode = {
    // The request is successful
    "200": {
        code: 200,
        message: "Successful "
    },
    // 	User rejects request
    "4001": {
        code: 4001,
        reason: "User Rejected Request",
        message: "The user rejected the request. "
    },
    // without authorization
    "4100": {
        code: 4100,
        reason: "Unauthorized",
        message: "The requested method and/or account has not been authorized by the user. "
    },
    // Unsupported methods
    "4200": {
        code: 4200,
        reason: "Unsupported Method",
        message: "The Provider does not support the requested method. "
    },
    // disconnect
    "4900": {
        code: 4900,
        reason: "Disconnected",
        message: "The Provider is disconnected from all chains."
    },
    // Chain disconnected
    "4901": {
        code: 4901,
        reason: "Chain Disconnected",
        message: "The Provider is not connected to the requested chain."
    },
    // Parse error
    "-32700":{
        code:"-32700",
        reason: "Parse error",
        message: "Invalid JSON"
    },
    // Invalid request
    "-32600":{
        code:"-32600",
        reason: "Invalid request",
        message: "JSON is not a valid request object"
    },
    // No invalid request method was found
    "-32601":{
        code:"-32601",
        reason: "Method not found",
        message: "Method does not exist"
    },
    // Invalid parameter
    "-32602":{
        code:"-32602",
        reason: "Invalid params",
        message: "Invalid method parameters"
    },
    "-32603":{
        code:"-32603",
        reason: "Internal error",
        message: "Internal JSON-RPC error"
    },
    // The input is invalid
    "-32000":{
        code:"-32000",
        reason: "Invalid input",
        message: "Missing or invalid parameters"
    },
    // Internal resources not found
    "-32001":{
        code:"-32001",
        reason: "Resource not found",
        message: "Requested resource not found"
    },
    // Resource unavailable
    "-32002":{
        code:"-32002",
        reason: "Resource unavailable",
        message: "Requested resource not available"
    },
    // The requested resource was denied
    "-32003":{
        code:"-32003",
        reason: "Transaction rejected",
        message: "Transaction creation failed"
    },

}

export enum EventInfo {
    // Link to the purse
    connect = "connect",
    // Disconnect the purse
    disconnect = "disconnect",
    // Chain change
    chainChanged = "chainChanged",
    // Account change
    accountsChanged = "accountsChanged",
    // Subscribe to JSON-RPC notifications, GraphQL subscriptions, and/or any other events defined by the Provider. 
    message = "message"
}
