import { Module } from '@nestjs/common';
import { HttpClientService } from './http.service';

@Module({
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpModule {}
