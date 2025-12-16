import { useState, useEffect } from 'react'
// Cardano serialization lib for robust address parsing/validation
import { Address as CSLAddress } from '@emurgo/cardano-serialization-lib-browser'
import { useWallet } from '@meshsdk/react'
import { BrowserWallet } from '@meshsdk/core'
import type { WalletState } from '../types'

const sanitizeString = (str: string): string => {
    let s = String(str || '')
    if ((s as any).normalize) s = (s as any).normalize('NFKC')
    s = s.replace(/\uFEFF/g, '')
    s = s.replace(/[\u200B-\u200D]/g, '')
    s = s.replace(/[\x00-\x1F\x7F]/g, '')
    s = s.replace(/[^\x00-\x7F]/g, '')
    return s.trim()
}

export function useCardanoWallet() {
    const { connected, connecting, wallet, connect, disconnect, name } = useWallet()
    const [walletState, setWalletState] = useState<WalletState>({
        connected: false,
        address: null,
        network: null,
        balance: null,
    })
    // Debug states for UI diagnostics: raw address from wallet, normalized/bech32, and last signing error
    const [lastRawAddress, setLastRawAddress] = useState<string | null>(null)
    const [lastNormalizedAddress, setLastNormalizedAddress] = useState<string | null>(null)
    const [lastSignError, setLastSignError] = useState<any>(null)
    const [availableWallets, setAvailableWallets] = useState<Array<{ name: string; icon: string; version: string }>>([])

    useEffect(() => {
        const getWallets = () => {
            try {
                // Try MeshSDK first
                const meshWallets = BrowserWallet.getInstalledWallets() || []
                console.debug('MeshSDK wallets:', meshWallets)

                // Also check window.cardano directly as fallback
                const cardano = (window as any).cardano
                console.debug('window.cardano:', cardano)

                if (!cardano) {
                    console.warn('window.cardano not found - no wallet extensions detected')
                    return meshWallets
                }

                // Manually detect wallets from window.cardano
                const directWallets: Array<{ name: string; icon: string; version: string }> = []

                // Common wallet keys to check
                const walletKeys = ['lace', 'nami', 'eternl', 'flint', 'gerowallet', 'typhon']

                walletKeys.forEach(key => {
                    if (cardano[key] && typeof cardano[key].enable === 'function') {
                        const wallet = cardano[key]
                        directWallets.push({
                            name: key,
                            icon: wallet.icon || '',
                            version: wallet.apiVersion || wallet.version || '1.0.0'
                        })
                        console.info(`✅ Detected ${key} wallet via window.cardano`)
                    }
                })

                // Merge both sources, preferring direct detection
                const allWallets = [...directWallets]
                meshWallets.forEach((mw: any) => {
                    if (!allWallets.find(w => w.name.toLowerCase() === mw.name.toLowerCase())) {
                        allWallets.push(mw)
                    }
                })

                console.log('Total wallets detected:', allWallets)
                return allWallets
            } catch (e) {
                console.warn('Failed to get installed wallets:', e)
                return []
            }
        }

        // Initial check
        setAvailableWallets(getWallets())

        // Poll for wallets in case injection is delayed
        const interval = setInterval(() => {
            const currentWallets = getWallets()
            setAvailableWallets(prev => {
                if (prev.length !== currentWallets.length) return currentWallets
                return prev
            })
        }, 1000)

        // Stop polling after 10 seconds (increased from 5)
        const timeout = setTimeout(() => {
            clearInterval(interval)
            console.log('Wallet polling stopped. Final count:', getWallets().length)
        }, 10000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [])

    useEffect(() => {
        const updateWalletState = async () => {
            if (connected && wallet) {
                try {
                    let addresses = await wallet.getUsedAddresses()
                    let address = addresses.length > 0 ? addresses[0] : null

                    if (!address) {
                        try {
                            const unused = await wallet.getUnusedAddresses()
                            if (unused.length > 0) address = unused[0]
                        } catch (e) {
                            console.warn('Failed to get unused addresses', e)
                        }
                    }

                    if (!address) {
                        try {
                            address = await wallet.getChangeAddress()
                        } catch (e) {
                            console.warn('Failed to get change address', e)
                        }
                    }

                    if (!address) {
                        console.warn('No address found in wallet')
                        // Proceed partially connected so user sees UI but arguably should be valid
                    }
                    const lovelace = await wallet.getLovelace()
                    const networkId = await wallet.getNetworkId()

                    // Debug: log the raw addresses returned by the wallet to help diagnose
                    // bech32 / mixed-case issues. This prints the arrays and a small
                    // char-code summary for inspection in the browser console.
                    try {
                        console.debug('Wallet getUsedAddresses raw:', addresses)
                        if (addresses && addresses.length > 0) {
                            const sample = addresses[0]
                            console.debug('Used address sample:', sample)
                            console.debug('Used address head char codes:', Array.from(sample).slice(0, 8).map(c => ({ c, code: c.charCodeAt(0) })))
                            console.debug('Used address tail char codes:', Array.from(sample).slice(-8).map(c => ({ c, code: c.charCodeAt(0) })))
                        }

                        // Also attempt to log unused and change addresses if available
                        try {
                            const unused = await wallet.getUnusedAddresses()
                            console.debug('Wallet getUnusedAddresses raw:', unused)
                        } catch (e) {
                            // ignore if wallet doesn't implement
                        }
                        try {
                            const change = await wallet.getChangeAddress()
                            console.debug('Wallet getChangeAddress raw:', change)
                        } catch (e) {
                            // ignore if wallet doesn't implement
                        }
                    } catch (logErr) {
                        console.debug('Failed to log wallet address details:', logErr)
                    }

                    setWalletState({
                        connected: true,
                        address,
                        network: networkId === 0 ? 'testnet' : 'mainnet',
                        balance: (parseInt(lovelace) / 1000000).toFixed(2) + ' ADA',
                    })
                } catch (error) {
                    console.error('Failed to fetch wallet details:', error)
                }
            } else {
                setWalletState({
                    connected: false,
                    address: null,
                    network: null,
                    balance: null,
                })
            }
        }

        updateWalletState()
    }, [connected, wallet])

    const signMessage = async (message: string): Promise<string> => {
        if (!connected || !wallet) throw new Error('Wallet not connected')

        try {
            // Collect all possible address candidates from the wallet and try them in order.
            const candidates: string[] = []
            try {
                const usedAddresses = await wallet.getUsedAddresses()
                candidates.push(...usedAddresses)
            } catch (e) {
                // ignore
            }
            try {
                const unusedAddresses = await wallet.getUnusedAddresses()
                candidates.push(...unusedAddresses)
            } catch (e) {
                // ignore
            }
            try {
                const change = await wallet.getChangeAddress()
                if (change) candidates.push(change)
            } catch (e) {
                // ignore
            }

            // Deduplicate while preserving order
            const seen = new Set<string>()
            const uniqueCandidates = candidates.filter((c) => {
                if (!c) return false
                if (seen.has(c)) return false
                seen.add(c)
                return true
            })

            if (uniqueCandidates.length === 0) {
                throw new Error('No addresses found in wallet. Please ensure your wallet is initialized.')
            }

            // Reset diagnostic state
            setLastRawAddress(null)
            setLastNormalizedAddress(null)
            setLastSignError(null)

            // Sanitize and normalize the address to avoid hidden/unicode/control characters
            // that can break bech32 decoding (error: "String must be lowercase or uppercase").
            try {
                let addr = String(walletState.address || '')

                // Basic normalization of visible problems (unicode, BOM, zero-width)
                if ((addr as any).normalize) addr = (addr as any).normalize('NFKC')
                addr = addr.replace(/\uFEFF/g, '')
                addr = addr.replace(/[\u200B-\u200D]/g, '')
                addr = addr.replace(/[\x00-\x1F\x7F]/g, '')
                addr = addr.replace(/[^\x00-\x7F]/g, '')
                addr = addr.trim()

                console.debug('Sanitized signing address:', { addr, raw: walletState.address })
                const headCodes = Array.from(addr).slice(0, 8).map((c) => ({ c, code: c.charCodeAt(0) }))
                const tailCodes = Array.from(addr).slice(-8).map((c) => ({ c, code: c.charCodeAt(0) }))
                console.debug('Address head char codes:', headCodes, 'tail char codes:', tailCodes)

                // Normalization + detection/convert helper
                const normalizeAddress = (candidate: string) => {
                    const raw = String(candidate || '').trim()

                    // 1) try bech32 parse
                    // 1) try bech32 parse (handle mixed case by trying lower first)
                    try {
                        const parsed = CSLAddress.from_bech32(raw.toLowerCase())
                        return parsed.to_bech32()
                    } catch (bechErr) {
                        // try original if lowercase failed (e.g. if it was all uppercase bech32)
                        try {
                            const parsed = CSLAddress.from_bech32(raw)
                            return parsed.to_bech32()
                        } catch (e2) {
                            // continue to hex attempt
                        }
                    }

                    // 2) try hex string (maybe wallet returned hex bytes)
                    const maybeHex = raw.replace(/^0x/i, '')
                    if (/^[0-9a-fA-F]+$/.test(maybeHex) && maybeHex.length % 2 === 0) {
                        // convert hex to bytes
                        const bytes = new Uint8Array(maybeHex.length / 2)
                        for (let i = 0; i < bytes.length; i++) {
                            bytes[i] = parseInt(maybeHex.substr(i * 2, 2), 16)
                        }
                        try {
                            const parsed = CSLAddress.from_bytes(bytes)
                            return parsed.to_bech32()
                        } catch (hexErr) {
                            // fallthrough
                        }
                    }

                    // 3) final attempt: if string looks like base64 bytes, try decode (not common)
                    try {
                        // base64 detection: contains only base64 chars and length multiple of 4
                        const b64 = raw.replace(/\s+/g, '')
                        if (/^[A-Za-z0-9+/=]+$/.test(b64) && b64.length % 4 === 0) {
                            const decoded = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
                            const parsed = CSLAddress.from_bytes(decoded)
                            return parsed.to_bech32()
                        }
                    } catch (b64Err) {
                        // ignore
                    }

                    throw new Error('Address is not valid bech32/hex/base64')
                }

                // Try each candidate as returned by the wallet first (use exact original string)
                for (const rawCandidate of uniqueCandidates) {
                    const candidate = sanitizeString(rawCandidate)
                    try {
                        setLastRawAddress(candidate)
                        console.debug('Attempting wallet.signData with wallet-provided address candidate', { candidate })
                        const sig = await wallet.signData(candidate, message)
                        // success
                        setLastNormalizedAddress(null)
                        console.info('✅ SIGNING SUCCESSFUL with WALLET-PROVIDED candidate:', candidate)
                        return sig.signature
                    } catch (errCandidate: any) {
                        console.warn('Direct signData with wallet-provided candidate failed', { candidate, error: errCandidate })
                        // record attempt
                        setLastSignError({ phase: 'direct', error: errCandidate, candidate })
                        // continue to next candidate
                    }
                }

                // If direct attempts failed, try normalizing each candidate and sign with the normalized bech32
                for (const rawCandidate of uniqueCandidates) {
                    const candidate = sanitizeString(rawCandidate)
                    try {
                        setLastRawAddress(candidate)
                        const normalized = normalizeAddress(candidate)
                        setLastNormalizedAddress(normalized)
                        console.debug('Attempting wallet.signData with normalized candidate', { candidate, normalized })
                        const sig = await wallet.signData(normalized, message)
                        console.info('✅ SIGNING SUCCESSFUL with NORMALIZED bech32:', normalized, '(derived from:', candidate, ')')
                        return sig.signature
                    } catch (errNorm: any) {
                        console.warn('Normalized signData failed', { candidate, error: errNorm })
                    }
                }

                // 3) Try converting to Hex (CBOR) format - required by some wallets (e.g. Lace)
                for (const rawCandidate of uniqueCandidates) {
                    const candidate = sanitizeString(rawCandidate)
                    try {
                        let hexVal: string | null = null
                        try {
                            // Try from bech32 - Force lowercase to handle potential mixed-case from wallet
                            hexVal = Array.from(CSLAddress.from_bech32(candidate.toLowerCase()).to_bytes())
                                .map(b => b.toString(16).padStart(2, '0'))
                                .join('')
                        } catch (e) {
                            // If simple lowercase bech32 failed, try original (might be upper) or just continue
                            try {
                                hexVal = Array.from(CSLAddress.from_bech32(candidate).to_bytes())
                                    .map(b => b.toString(16).padStart(2, '0'))
                                    .join('')
                            } catch (e2) {
                                // If not bech32, checks if it is valid hex already
                                if (/^[0-9a-fA-F]+$/.test(candidate) && candidate.length % 2 === 0) {
                                    hexVal = candidate
                                }
                            }
                        }

                        if (hexVal) {
                            setLastRawAddress(hexVal)
                            console.debug('Attempting wallet.signData with HEX candidate', { candidate, hexVal })
                            const sig = await wallet.signData(hexVal, message)
                            setLastNormalizedAddress(hexVal)
                            console.info('✅ SIGNING SUCCESSFUL with HEX format:', hexVal, '(derived from:', candidate, ')')
                            return sig.signature
                        }
                    } catch (errHex: any) {
                        console.warn('Hex signData failed', { candidate, error: errHex })
                        setLastSignError({ phase: 'hex', error: errHex, candidate })
                    }
                }

                // If still failing, attempt lower/upper variants of the first sanitized addr
                const lower = addr.toLowerCase()
                const upper = addr.toUpperCase()
                try {
                    setLastRawAddress(lower)
                    const normalizedLower = normalizeAddress(lower)
                    setLastNormalizedAddress(normalizedLower)
                    const sig = await wallet.signData(normalizedLower, message)
                    console.info('✅ SIGNING SUCCESSFUL with LOWERCASE normalized:', normalizedLower)
                    return sig.signature
                } catch (eLower: any) {
                    console.warn('Lowercase normalized attempt failed', { eLower })
                    setLastSignError({ phase: 'lowercase', error: eLower })
                }
                try {
                    setLastRawAddress(upper)
                    const normalizedUpper = normalizeAddress(upper)
                    setLastNormalizedAddress(normalizedUpper)
                    const sig = await wallet.signData(normalizedUpper, message)
                    console.info('✅ SIGNING SUCCESSFUL with UPPERCASE normalized:', normalizedUpper)
                    return sig.signature
                } catch (eUpper: any) {
                    console.warn('Uppercase normalized attempt failed', { eUpper })
                    setLastSignError({ phase: 'uppercase', error: eUpper })
                }

                // All attempts exhausted
                const finalErr = new Error('Signing failed for all candidate address formats')
                setLastSignError({ phase: 'all', error: finalErr })
                throw finalErr
            } catch (innerError) {
                console.error('Failed to sign with sanitized address. Address:', walletState.address, 'error:', innerError)

                // Fallback: Try direct CIP-30 call to bypass Mesh/CSL validation issues
                try {
                    console.info('Attempting direct CIP-30 signData fallback...')
                    const walletKey = name || ''
                    // @ts-ignore
                    if (window.cardano && walletKey && window.cardano[walletKey]) {
                        // @ts-ignore
                        const api = await window.cardano[walletKey].enable()
                        const messageHex = Array.from(new TextEncoder().encode(message))
                            .map(b => b.toString(16).padStart(2, '0'))
                            .join('')

                        // Try with the last normalized/hex address we derived
                        // If we don't have one, just try to get one from the string
                        let addrToUse = lastNormalizedAddress
                        if (!addrToUse && walletState.address) {
                            try {
                                const sanitized = sanitizeString(walletState.address)
                                // Convert bech32 to hex bytes if possible
                                const bytes = CSLAddress.from_bech32(sanitized.toLowerCase()).to_bytes()
                                addrToUse = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
                            } catch (e) {
                                // ignore
                            }
                        }

                        if (addrToUse) {
                            // Some wallets expect Hex string for address
                            console.debug('Fallback signing with addr:', addrToUse)
                            const sigStruct = await api.signData(addrToUse, messageHex)
                            console.info('✅ SIGNING SUCCESSFUL via CIP-30 Fallback!')
                            return sigStruct.signature
                        }
                    }
                } catch (fallbackErr) {
                    console.error('Fallback CIP-30 signing also failed:', fallbackErr)
                }

                setLastSignError({ phase: 'normalize', error: innerError, raw: walletState.address })
                throw innerError
            }
        } catch (error: any) {
            console.error('Failed to sign message:', error)
            // Pass through the specific error message from the wallet (e.g. "User declined")
            if (error.message) {
                throw new Error(error.message);
            } else if (typeof error === 'string') {
                throw new Error(error);
            }
            throw new Error('Failed to sign message. Please check your wallet popup.');
        }
    }

    return {
        wallet,
        wallets: availableWallets,
        walletState,
        connected,
        connecting,
        walletName: name,
        connect,
        disconnect: disconnect || (() => Promise.resolve()),
        signMessage,
        // Debug diagnostics
        lastRawAddress,
        lastNormalizedAddress,
        lastSignError,
    }
}

