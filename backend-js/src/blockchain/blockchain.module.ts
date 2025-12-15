import { Module, Global } from '@nestjs/common';
import { CardanoService } from './cardano.service';
import { HashService } from './hash.service';

@Global()
@Module({
  providers: [CardanoService, HashService],
  exports: [CardanoService, HashService],
})
export class BlockchainModule {}
