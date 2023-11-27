import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from '../entities/queue.entity';
import { CreateQueueDTO } from './dtos/create-queue.dto';
import { UpdateQueueDTO } from './dtos/udate-queue.dto';
import { QueueUser } from '../entities/queue-user.entity';
import { HttpClientService } from 'src/http/http.service';
import { UserRole } from 'src/interfaces/user.interface';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue)
    private readonly queueRepository: Repository<Queue>,
    @InjectRepository(QueueUser)
    private readonly queueUserRepository: Repository<QueueUser>,
    private readonly httpService: HttpClientService,
  ) {}

  MAX_POSITIONS = 10;

  async findById(id: string) {
    const queue = await this.queueRepository.findOneBy({ id });

    const queueUsers = await this.queueUserRepository.find({
      where: { queueId: queue.id },
    });

    const participants = await this.findParticipantsByQueueUsers(queueUsers);

    return { ...queue, participantsCount: participants.length, participants };
  }

  async listByOwner(ownerId: string) {
    await this.validateOwner(ownerId);

    if (!ownerId) {
      throw new NotFoundException('O campo ownerId é obrigatório!');
    }

    const queues = await this.queueRepository.find({ where: { ownerId } });

    const queuesWithParticipantsNumber = await Promise.all(
      queues.map(async (queue) => {
        const participantsCount = await this.queueUserRepository.count({
          where: { queueId: queue.id },
        });

        return { ...queue, participantsCount };
      }),
    );

    return queuesWithParticipantsNumber;
  }

  async create(createQueueDTO: CreateQueueDTO) {
    await this.validateOwner(createQueueDTO.ownerId);
    // await this.validateQueueWithSameTitle(createQueueDTO.title);

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
    await this.queueUserRepository.delete({ queueId: id });

    return { success: true };
  }

  async addUser(queueId: string, userId: string) {
    try {
      const { queueMembers, memberToInsert, queue } =
        await this.validateUserAddition(queueId, userId);

      await this.queueUserRepository.save({
        position: queueMembers.length + 1,
        queueId: queue.id,
        userId: memberToInsert.id,
      });

      return { success: true };
    } catch (e) {
      console.error('-=-= ERRO no método QueueService.addUser', e.data);

      if (e instanceof HttpException) throw e;

      throw new BadRequestException('Não foi possível entrar na fila');
    }
  }

  async replaceUserPosition(
    queueId: string,
    userId: string,
    newPosition: number,
  ) {
    const queueMembers = await this.queueUserRepository.findBy({
      queueId,
      exited: false,
    });

    const member = queueMembers.find((member) => member.userId === userId);

    if (!member) throw new BadRequestException('Usuário não pertence à fila');

    await this.queueUserRepository.manager.transaction(async (manager) => {
      const users = await manager.findBy(QueueUser, { queueId });

      users.forEach(async (user) => {
        if (user.userId === userId) return;

        if (user.position >= newPosition) {
          await manager.update(
            QueueUser,
            { userId: user.userId },
            { position: user.position + 1 },
          );
        }
      });

      await manager.update(QueueUser, { userId }, { position: newPosition });
    });
  }

  async findParticipantsByQueueId(queueId: string) {
    const participants = await this.queueUserRepository.find({
      where: { queueId },
    });

    return participants;
  }

  private async validateOwner(ownerId: string) {
    try {
      const owner = await this.httpService.findUserById(ownerId);

      if (owner.role !== UserRole.MANAGER) throw new Error();
    } catch (e) {
      throw new ForbiddenException('Função não está disponível');
    }
  }

  private async findParticipantsByQueueUsers(queueUsers: QueueUser[]) {
    const userIds = queueUsers.map((queueUser) => queueUser.userId);

    // TODO: implementar método para chamar dentro do service de users
    // os usuários com os ids do array acima
    const users = await this.httpService.findUsersInfosByIds(userIds);

    return queueUsers.map((queueUser) => {
      const user = users.find((user) => user.id === queueUser.userId);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        joined_at: queueUser.created_at,
      };
    });
  }

  private async validateUserAddition(queueId: string, userId: string) {
    const queue = await this.queueRepository.findOneOrFail({
      where: { id: queueId },
    });

    const memberToInsert = await this.httpService.findUserById(userId);

    if (memberToInsert.role === UserRole.MANAGER)
      throw new BadRequestException('Gerentes não podem participar de filas');

    const queueMembers = await this.queueUserRepository.find({
      where: {
        queueId: queue.id,
        exited: false,
      },
    });

    if (queue.maxParticipants === queueMembers.length) {
      throw new BadRequestException(
        `A fila já está com seu limite de ${queue.maxParticipants} participantes`,
      );
    }

    const isUserAlreadyAtQueue = !!queueMembers.find(
      (queueMember) => queueMember.userId === userId,
    );

    if (isUserAlreadyAtQueue) {
      throw new BadRequestException('Você já está na fila');
    }

    return {
      queue,
      memberToInsert,
      queueMembers,
    };
  }

  private async validateQueueWithSameTitle(title: string) {
    const queueWithSameName = await this.queueRepository.findOneBy({
      title,
    });

    if (queueWithSameName) {
      throw new BadRequestException('Você já tem uma fila com esse nome');
    }
  }
}
