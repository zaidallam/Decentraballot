import { useEffect, useCallback, useState } from 'react';
import { ethers } from 'ethers';

export default function useMetamask() {
        const [isConnected, setIsConnected] = useState(false);
        const [provider, setProvider] = useState();
        const [signer, setSigner] = useState();

        const handleAccountsChanged = useCallback(async () => {
                if ((await ethereum.request({ method: "eth_accounts" })).length === 0) {
                setIsConnected(false);
                }
        }, []);

        const lisenForAccountsChanged = () => {
                if (isConnected) {
                        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                }
                window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        const setupConnection = () => {
                let connectedProvider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(connectedProvider);
                setSigner(connectedProvider.getSigner());
                lisenForAccountsChanged();
                setIsConnected(true);
        }

        const connectWallet = async (event) => {
                if (typeof window.ethereum !== 'undefined') {
                        try {
                                await ethereum.request({ method: 'eth_requestAccounts' });
                                setupConnection();
                        } catch (e) {
                                console.log(e);
                        }
                } else {
                        alert('Please install MetaMask');
                        setIsConnected(false);
                }

                event.target.blur();
        }

        const checkConnection = async () => {
                if (typeof window.ethereum === 'undefined') {
                        return;
                }

                if ((await ethereum.request({ method: "eth_accounts" })).length === 0) {
                        return;
                }
                
                setupConnection();
                
                return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }

        useEffect(() => { checkConnection() }, []);

        return { isConnected, provider, signer, connectWallet };
}