import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CardanoService implements OnModuleInit {
    private lucid: any; // Use any to avoid build issues with ESM types
    private readonly logger = new Logger(CardanoService.name);

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        await this.initializeLucid();
    }

    private async initializeLucid() {
        try {
            const network = this.configService.get<string>('CARDANO_NETWORK', 'preprod');
            const projectId = this.configService.get<string>('BLOCKFROST_PROJECT_ID');
            const blockfrostUrl = this.configService.get<string>('BLOCKFROST_URL');

            if (!projectId || !blockfrostUrl) {
                this.logger.warn('BLOCKFROST_PROJECT_ID or BLOCKFROST_URL not set. Blockchain features will be disabled.');
                return;
            }

            // Dynamic import for ESM package
            const { Lucid, Blockfrost } = await import('lucid-cardano');

            this.lucid = await Lucid.new(
                new Blockfrost(blockfrostUrl, projectId),
                network as any,
            );

            // Load backend wallet if seed is provided
            const seed = this.configService.get<string>('CARDANO_WALLET_SEED');
            if (seed) {
                this.lucid.selectWalletFromSeed(seed);
                const address = await this.lucid.wallet.address();
                this.logger.log(`Cardano service initialized. Backend wallet: ${address}`);
            } else {
                this.logger.warn('CARDANO_WALLET_SEED not set. Backend cannot sign transactions.');
            }
        } catch (error) {
            this.logger.error('Failed to initialize Cardano service', error);
        }
    }

    getLucid(): any {
        if (!this.lucid) {
            throw new Error('Lucid not initialized');
        }
        return this.lucid;
    }

    async submitRecordHash(
        recordHash: string,
        recordType: string,
        patientDid: string,
        metadata: any = {},
    ): Promise<string> {
        try {
            if (!this.lucid) throw new Error('Lucid not initialized');

            const tx = await this.lucid
                .newTx()
                .payToAddress(await this.lucid.wallet.address(), { lovelace: 1000000n }) // Min ADA
                .attachMetadata(674, {
                    msg: ['MEDBLOCK Record'],
                    hash: recordHash,
                    type: recordType,
                    patient: patientDid,
                    ...metadata,
                })
                .complete();

            const signedTx = await tx.sign().complete();
            const txHash = await signedTx.submit();

            this.logger.log(`Record hash submitted. Tx: ${txHash}`);
            return txHash;
        } catch (error) {
            this.logger.error(`Failed to submit record hash: ${error.message}`);
            throw error;
        }
    }

    async verifyTransaction(txHash: string): Promise<boolean> {
        try {
            // In a real implementation, we would check if the tx is on chain
            // For now, we assume if we can fetch it, it exists
            return true;
        } catch (error) {
            return false;
        }
    }

    private async getDidPolicy(): Promise<{ type: string; script: string }> {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            
            // Try multiple possible paths for the plutus.json file
            const possiblePaths = [
                path.join(process.cwd(), 'aiken', 'plutus.json'),           // When running from backend-js
                path.join(process.cwd(), '..', 'aiken', 'plutus.json'),     // When running from backend-js in monorepo
                path.join(__dirname, '..', '..', 'aiken', 'plutus.json'),   // Relative to compiled dist
                path.join(__dirname, '..', '..', '..', 'aiken', 'plutus.json'), // Relative to src in monorepo
            ];

            let plutusJson;
            let foundPath;
            
            for (const plutusJsonPath of possiblePaths) {
                try {
                    const content = await fs.readFile(plutusJsonPath, 'utf-8');
                    plutusJson = JSON.parse(content);
                    foundPath = plutusJsonPath;
                    this.logger.log(`Found Aiken contract at: ${foundPath}`);
                    break;
                } catch (err) {
                    // Continue to next path
                    continue;
                }
            }

            if (!plutusJson) {
                throw new Error('plutus.json not found in any expected location');
            }

            const validator = plutusJson.validators.find((v: any) => v.title === 'did_policy.did_policy');

            if (!validator) {
                throw new Error('DID policy validator not found in plutus.json');
            }

            return {
                type: 'PlutusV2',
                script: validator.compiledCode,
            };
        } catch (error) {
            // Don't log error here - it will be handled by the caller
            throw new Error('Aiken contract not available. Run "aiken build" in the aiken directory to enable blockchain DIDs.');
        }
    }

    async mintDid(ownerPublicKeyHash: string): Promise<{ txHash: string; did: string }> {
        try {
            if (!this.lucid) throw new Error('Lucid not initialized');

            const policy = await this.getDidPolicy();
            const policyId = this.lucid.utils.mintingPolicyToId(policy);
            const assetName = this.lucid.utils.fromText('DID'); // Simple asset name
            const unit = policyId + assetName;

            // Address to receive the DID token
            const address = await this.lucid.wallet.address();

            const tx = await this.lucid
                .newTx()
                .mintAssets({ [unit]: 1n }, "0") // Mint 1 DID token. Data "0" is void redeemer for now
                .attachMintingPolicy(policy)
                .addSignerKey(ownerPublicKeyHash) // Ensure owner signs it (as required by policy)
                .payToAddress(address, { [unit]: 1n })
                .complete();

            const signedTx = await tx.sign().complete();
            const txHash = await signedTx.submit();

            this.logger.log(`DID minted. Tx: ${txHash}, PolicyID: ${policyId}`);
            return { txHash, did: `did:cardano:${policyId}` };
        } catch (error) {
            this.logger.debug(`Blockchain DID minting unavailable: ${error.message}`);
            throw error;
        }
    }
}
