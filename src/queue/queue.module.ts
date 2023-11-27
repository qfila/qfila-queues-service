import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from '../entities/queue.entity';
import { QueueUser } from 'src/entities/queue-user.entity';
import { HttpModule } from 'src/http/http.module';

@Module({
  imports: [TypeOrmModule.forFeature([Queue, QueueUser]), HttpModule],
  controllers: [QueueController],
  providers: [QueueService],
})
export class QueueModule {}
