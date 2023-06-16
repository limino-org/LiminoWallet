
// Activity event
export enum eventsEmitter {
  // Account switching
  accountsChanged = 'accountsChanged',
  // Chain switch
  chainChanged = 'chainChanged',
  // connected
  connect = 'connect',
  // disconnect
  disconnect = 'disconnect'
}


// The type of API that is open to the public
export enum handleType {
  // Signature 
  eth_sign = "eth_sign",
  // Get block height
  eth_blockNumber = "eth_blockNumber",
  // trade
  eth_sendTransaction = "eth_sendTransaction",
  // Signature Single signature data
  personal_sign = "personal_sign",
  // Signing multiple signature data
  multiple_sign = "multiple_sign",
  // Obtaining the network ID
  eth_getNetWork = "eth_getNetWork",
  // Connect to wallet
  wallet_requestPermissions = 'wallet_requestPermissions',
  // Connect to wallet
  eth_requestAccounts = 'eth_requestAccounts',
  // For chain id 
  eth_chainId = 'eth_chainId',
  // Gets the current wallet address
  eth_accounts = 'eth_accounts',
  // TODO Subscribe to news
  eth_subscription = 'eth_subscription',
  // Estimated gas cost
  eth_estimateGas = 'eth_estimateGas',
  // Obtain transaction information through transaction hash
  eth_getTransactionByHash = 'eth_getTransactionByHash',
  // Remove listening events
  removeAllListeners = 'removeAllListeners',
  // Get account balance
  eth_getBalance = 'eth_getBalance',
  net_version = 'net_version',
  logout = "logout",
  login = "login",
  getConnectList = "getConnectList",
  handleReject = 'handleReject'
}