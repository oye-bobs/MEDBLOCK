import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CardanoService } from '../blockchain/cardano.service';

@Injectable()
export class DidService {
    private readonly logger = new Logger(DidService.name);

    constructor(
        private configService: ConfigService,
        private cardanoService: CardanoService,
    ) { }

    async createDid(entityType: 'patient' | 'provider'): Promise<any> {
        this.logger.log(`Creating new DID for ${entityType}`);

        try {
            // Get the backend wallet's public key hash to use as the owner
            // In a real app, this would be the user's public key
            const lucid = this.cardanoService.getLucid();
            const address = await lucid.wallet.address();
            const details = lucid.utils.getAddressDetails(address);
            const pubKeyHash = details.paymentCredential.hash;

            // Generate a new private key for the entity
            const privateKey = lucid.utils.generatePrivateKey();

            // In a real implementation, we would derive the DID from this key
            // For now, we use the backend wallet to mint the DID but return this key to the user

            const result = await this.cardanoService.mintDid(pubKeyHash);

            return {
                did: result.did,
                txHash: result.txHash,
                controller: pubKeyHash,
                private_key: privateKey,
                createdAt: new Date().toISOString(),
            };
        } catch (error) {
            // Fallback to mock DID for various blockchain-related errors
            if (
                error.message.includes('Could not load Aiken contract') ||
                error.message.includes('Aiken contract not available') ||
                error.message.includes('plutus.json not found') ||
                error.message.includes('DID policy validator not found') ||
                error.message.includes('Lucid not initialized') ||
                error.message.includes('Blockfrost')
            ) {
                this.logger.warn(`Falling back to mock DID due to blockchain unavailability: ${error.message}`);
                const didSuffix = Math.random().toString(36).substring(2, 15);
                const timestamp = Date.now();
                return {
                    did: `did:medblock:${entityType}:${didSuffix}`,
                    private_key: `mock_private_key_${didSuffix}_${timestamp}`,
                    controller: 'mock_controller',
                    txHash: `mock_tx_${timestamp}`,
                    warning: 'This is a MOCK DID. Configure BLOCKFROST_PROJECT_ID and BLOCKFROST_URL in .env to enable real blockchain DIDs.',
                    createdAt: new Date().toISOString(),
                };
            }
            
            this.logger.error(`Failed to create DID: ${error.message}`);
            throw error;
        }
    }

    async resolveDid(did: string): Promise<any> {
        // TODO: Implement actual DID resolution
        this.logger.log(`Resolving DID: ${did}`);

        // Mock resolution
        return {
            did,
            publicKey: `pub_key_${did.split(':').pop()}`,
            active: true,
        };
    }

    async verifySignature(did: string, message: string, signature: string): Promise<boolean> {
        // TODO: Implement actual signature verification
        this.logger.log(`Verifying signature for DID: ${did}`);

        // Mock verification - accept if signature is present
        return !!signature;
    }
}
