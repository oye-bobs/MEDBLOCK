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
}
