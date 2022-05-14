import { useMemo } from 'react';
import { ethers } from 'ethers';
import { appAddress } from '../constants';

export default function useDecentraballot(isConnected, provider, signer) {
        return useMemo(() => {
                if (!isConnected || !provider || !signer) {
                    return null;
                }
        
                const appabi = [
                    {
                    "inputs": [
                        {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                        }
                    ],
                    "name": "contests",
                    "outputs": [
                        {
                        "internalType": "bytes32",
                        "name": "identifier",
                        "type": "bytes32"
                        },
                        {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                        },
                        {
                        "internalType": "address",
                        "name": "contractAddress",
                        "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                    },
                    {
                    "inputs": [
                        {
                        "internalType": "bytes32",
                        "name": "identifier",
                        "type": "bytes32"
                        },
                        {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                        },
                        {
                        "internalType": "bytes32[]",
                        "name": "candidates",
                        "type": "bytes32[]"
                        }
                    ],
                    "name": "createContest",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                    },
                    {
                    "inputs": [
                        {
                        "internalType": "bytes32",
                        "name": "identifier",
                        "type": "bytes32"
                        }
                    ],
                    "name": "getContestAddress",
                    "outputs": [
                        {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                    },
                    {
                    "inputs": [
                        {
                        "internalType": "bytes32",
                        "name": "identifier",
                        "type": "bytes32"
                        }
                    ],
                    "name": "getContestDescription",
                    "outputs": [
                        {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                    }
                ];
        
                let contract;
        
                try {
                    contract = new ethers.Contract(appAddress, appabi, signer);
                } catch (e) {
                    console.log(e);
                }
        
                return contract;
        }, [isConnected, provider, signer]);
}