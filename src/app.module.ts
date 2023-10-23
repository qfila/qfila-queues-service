import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueController } from './queue/queue.controller';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [AppController, QueueController],
  providers: [AppService],
})
export class AppModule {}
