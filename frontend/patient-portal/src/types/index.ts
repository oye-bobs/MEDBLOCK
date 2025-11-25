export interface Patient {
    id: string
    did: string
    name: Array<{
        given: string[]
        family: string
    }>
    gender: 'male' | 'female' | 'other' | 'unknown'
    birth_date: string
    telecom: Array<{
        system: string
        value: string
    }>
    address: Array<{
        line: string[]
        city: string
        state: string
        postalCode: string
    }>
}

export interface Observation {
    id: string
    patient_id: string
    status: string
    code: {
        coding: Array<{
            system: string
            code: string
            display: string
        }>
        text: string
    }
    value_quantity?: {
        value: number
        unit: string
        system: string
    }
    effective_datetime: string
    blockchain_hash: string
    blockchain_tx_id: string
    hash_verified?: boolean
}

export interface ConsentRecord {
    id: string
    patient_did: string
    provider_did: string
    status: 'active' | 'expired' | 'revoked' | 'pending'
    scope: string[]
    granted_at: string
    expires_at: string
    smart_contract_address: string
    consent_tx_id: string
}

export interface AccessLogEntry {
    id: string
    accessor_did: string
    patient_did: string
    resource_type: string
    resource_id: string
    action: 'read' | 'create' | 'update' | 'delete'
    accessed_at: string
    blockchain_tx_id: string
}

export interface WalletState {
    connected: boolean
    address: string | null
    network: string | null
    balance: string | null
}

export interface DIDCredentials {
    did: string
    public_key: string
    private_key: string
}
