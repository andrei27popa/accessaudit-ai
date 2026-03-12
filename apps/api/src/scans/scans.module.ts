import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'scan' }),
  ],
  controllers: [ScansController],
  providers: [ScansService],
  exports: [ScansService],
})
export class ScansModule {}
