import { useState, useEffect } from 'react'
import { useWallet } from '@meshsdk/react'
import type { WalletState } from '../types'

export function useCardanoWallet() {
    const { wallet, connected, connecting, connect, disconnect, name } = useWallet()
    const [walletState, setWalletState] = useState<WalletState>({
        connected: false,
        address: null,
        network: null,
        balance: null,
    })

    useEffect(() => {
        if (connected && wallet) {
            loadWalletInfo()
        } else {
            setWalletState({
                connected: false,
                address: null,
                network: null,
                balance: null,
            })
        }
    }, [connected, wallet])

    const loadWalletInfo = async () => {
        if (!wallet) return

        try {
            const addresses = await wallet.getUsedAddresses()
            const address = addresses[0] || null

            const networkId = await wallet.getNetworkId()
            const network = networkId === 0 ? 'testnet' : 'mainnet'

            const balanceValue = await wallet.getBalance()
            const balance = balanceValue ? formatAda(balanceValue) : null

            setWalletState({
                connected: true,
                address,
                network,
                balance,
            })
        } catch (error) {
            console.error('Error loading wallet info:', error)
        }
    }

    const signMessage = async (message: string): Promise<string | null> => {
        if (!wallet || !connected) {
            throw new Error('Wallet not connected')
        }

        try {
            const addresses = await wallet.getUsedAddresses()
            const address = addresses[0]

            const signature = await wallet.signData(address, message)
            return signature.signature
        } catch (error) {
            console.error('Error signing message:', error)
            return null
        }
    }

    const formatAda = (lovelace: string): string => {
        const ada = parseInt(lovelace) / 1000000
        return `${ada.toFixed(2)} ADA`
    }

    return {
        wallet,
        walletState,
        connected,
        connecting,
        walletName: name,
        connect,
        disconnect,
        signMessage,
    }
}
