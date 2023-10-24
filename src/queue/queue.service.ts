import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from './queue.entity';
import { CreateQueueDTO } from './dtos/create-queue.dto';
import { UpdateQueueDTO } from './dtos/udate-quote.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue)
    private readonly queueRepository: Repository<Queue>,
  ) {}

  async findById(id: string) {
    const queue = await this.queueRepository.findBy({ id });

    return queue;
  }

  async listByOwner(ownerId: string) {
    if (!ownerId) {
      throw new NotFoundException('O campo ownerId é obrigatório!');
    }

    const queues = await this.queueRepository.find({
      where: {
        ownerId,
      },
    });

    return queues;
  }

  async findByOwnerId(ownerId: string) {
    const queues = await this.queueRepository.find({ where: { ownerId } });

    return queues;
  }

  async create(createQueueDTO: CreateQueueDTO) {
    const queueToCreate = this.queueRepository.create(createQueueDTO);

    const createdQueue = await this.queueRepository.save(queueToCreate);

    return createdQueue;
  }

  async update(id: string, fields: UpdateQueueDTO) {
    const updatedQueue = await this.queueRepository.save({ id, ...fields });

    return updatedQueue;
  }

  async delete(id: string) {
    await this.queueRepository.delete(id);
  }
}
