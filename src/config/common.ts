import { baseSepolia, bscTestnet, sepolia } from "viem/chains";

export const env = '';

export const usdTokens = {
    [baseSepolia.id]: '0xaf3a3fd0eea662dd1aefa8b04c201038a4ff5761',
    [sepolia.id]: '0x48b7a2baa0ac16c222965cd091e766965e853019',
    [bscTestnet.id]: '0xf35a44977e9831f564c9af3b721748e840c1ef4c'
}


export const mintAbi = [{
    "inputs": [{
        "internalType": "address",
        "name": "address",
        "type": "address"
      },{
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }],
    "name": "mintTo",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }]