import { Module } from '@nestjs/common';
import { IapController } from './iap.controller';
import { IapService } from './iap.service';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [ProfileModule],
  controllers: [IapController],
  providers: [IapService],
})
export class IapModule {}
