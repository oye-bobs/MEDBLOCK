import { useState, useEffect } from 'react'
import type { WalletState } from '../types'

// Mock wallet hook for demo purposes
export function useCardanoWallet() {
    const [connected, setConnected] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const [walletName, setWalletName] = useState<string | null>(null)
    const [walletState, setWalletState] = useState<WalletState>({
        connected: false,
        address: null,
        network: null,
        balance: null,
    })

    const connect = async () => {
        setConnecting(true)
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        setConnected(true)
        setWalletName('Nami')
        setWalletState({
            connected: true,
            address: 'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3UQ...',
            network: 'testnet',
            balance: '150.00 ADA',
        })
        setConnecting(false)
    }

    const disconnect = () => {
        setConnected(false)
        setWalletName(null)
        setWalletState({
            connected: false,
            address: null,
            network: null,
            balance: null,
        })
    }

    const signMessage = async (message: string): Promise<string | null> => {
        // Simulate signing delay
        await new Promise(resolve => setTimeout(resolve, 800))
        // Store the signed message and signature in localStorage to be used by the API client
        const signature = 'mock_signature_for_demo_purposes_only'
        localStorage.setItem('message', message)
        localStorage.setItem('signature', signature)
        localStorage.setItem('did', 'did:prism:mock_demo_did')
        return signature
    }

    return {
        wallet: null,
        walletState,
        connected,
        connecting,
        walletName,
        connect,
        disconnect,
        signMessage,
    }
}
