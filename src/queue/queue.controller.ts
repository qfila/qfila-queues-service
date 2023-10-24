import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateQueueDTO } from './dtos/create-queue.dto';
import { QueueService } from './queue.service';
import { UpdateQueueDTO } from './dtos/udate-quote.dto';
import { QueueOwnerGuard } from './guards/queue-owner-guard';

@Controller('api')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get(':id')
  @UseGuards(QueueOwnerGuard)
  get(@Param('id') id: string) {
    return this.queueService.findById(id);
  }

  @Get('')
  @UseGuards(QueueOwnerGuard)
  listByOwner(@Query('ownerId') ownerId: string) {
    return this.queueService.listByOwner(ownerId);
  }

  @Post()
  create(@Body() createQueueDTO: CreateQueueDTO) {
    return this.queueService.create(createQueueDTO);
  }

  @Put(':id')
  @UseGuards(QueueOwnerGuard)
  update(@Body() updateQueueDTO: UpdateQueueDTO, @Param('id') id: string) {
    return this.queueService.update(id, updateQueueDTO);
  }
}
