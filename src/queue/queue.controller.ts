import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Body,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { CreateQueueDTO } from './dtos/create-queue.dto';
import { QueueService } from './queue.service';
import { UpdateQueueDTO } from './dtos/udate-queue.dto';
import { QueueOwnerGuard } from './guards/queue-owner-guard';
import { AddUserDTO } from './dtos/add-user.dto';
import { ReplaceUserPositionDTO } from './dtos/replace-user-position.dto';
import { QueueOwnerOrParticipantGuard } from './guards/queue-owner-or-participant.guard';

@Controller('api')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get(':id')
  @UseGuards(QueueOwnerOrParticipantGuard)
  get(@Param('id') id: string) {
    return this.queueService.findById(id);
  }

  @Get('')
  listByOwner(@Query('userId') userId: string, @Query('code') code?: string) {
    if (code) return this.queueService.findByCode(code, userId);

    return this.queueService.listByOwner(userId);
  }

  @Post()
  create(@Body() createQueueDTO: CreateQueueDTO) {
    return this.queueService.create(createQueueDTO);
  }

  @Post(':code/user')
  addUser(@Param('code') code: string, @Body() addUserDTO: AddUserDTO) {
    return this.queueService.addUser(code, addUserDTO.userId);
  }

  @Put(':id/users/:user_id/replace_position')
  @UseGuards(QueueOwnerGuard)
  replaceUserPosition(
    @Param('id') id: string,
    @Param('user_id') userId: string,
    @Body() replaceUserPositionDTO: ReplaceUserPositionDTO,
  ) {
    return this.queueService.replaceUserPosition(
      id,
      userId,
      replaceUserPositionDTO.newPosition,
    );
  }

  @Put(':id')
  @UseGuards(QueueOwnerGuard)
  update(@Body() updateQueueDTO: UpdateQueueDTO, @Param('id') id: string) {
    return this.queueService.update(id, updateQueueDTO);
  }

  @Delete(':id')
  @UseGuards(QueueOwnerGuard)
  delete(@Param('id') id: string) {
    return this.queueService.delete(id);
  }

  @Delete(':id/user/:userId')
  @UseGuards(QueueOwnerGuard)
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.queueService.removeUser(id, userId);
  }
}
