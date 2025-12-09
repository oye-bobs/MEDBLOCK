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
            this.logger.error(`Failed to create DID: ${error.message}`);
            // Fallback to mock if blockchain fails (e.g. no funds, no aiken build)
            if (error.message.includes('Could not load Aiken contract')) {
                this.logger.warn('Falling back to mock DID due to missing Aiken contract.');
                const didSuffix = Math.random().toString(36).substring(2, 15);
                return {
                    did: `did:prism:${didSuffix} (MOCK)`,
                    private_key: 'mock_private_key_' + didSuffix,
                    warning: 'This is a MOCK DID. Run "aiken build" to enable real DIDs.',
                };
            }
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
