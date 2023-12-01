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
      where: { queueId: queue.id, exited: false },
    });

    const participants = await this.findParticipantsByQueueUsers(queueUsers);

    console.log(participants);

    return { ...queue, participantsCount: participants.length, participants };
  }

  async findByCode(code: string, userId: string) {
    const queue = await this.queueRepository.findOneBy({ code });

    const queueUsers = await this.queueUserRepository.find({
      where: { queueId: queue.id, exited: false },
    });

    const participant = queueUsers.find(
      (queueUser) => queueUser.userId === userId,
    );

    if (!participant && queue.ownerId !== userId) {
      throw new ForbiddenException('Ação indisponível');
    }

    const participants = await this.findParticipantsByQueueUsers(queueUsers);

    if (participant)
      return {
        ...queue,
        participantsCount: participants.length,
        currentPosition: participant.position,
        joinedAt: participant.created_at,
      };

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
          where: { queueId: queue.id, exited: false },
        });

        return { ...queue, participantsCount };
      }),
    );

    return queuesWithParticipantsNumber;
  }

  async create(createQueueDTO: CreateQueueDTO) {
    await this.validateOwner(createQueueDTO.ownerId);
    await this.validateQueueWithSameTitle(createQueueDTO.title);

    const code = await this.generateNewCode();

    const queueToCreate = this.queueRepository.create({
      ...createQueueDTO,
      code,
    });

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

  async addUser(queueCode: string, userId: string) {
    try {
      const { queueMembers, memberToInsert, queue } =
        await this.validateUserAddition(queueCode, userId);

      await this.queueUserRepository.save({
        position: queueMembers.length + 1,
        queueId: queue.id,
        userId: memberToInsert.id,
      });

      return { success: true, queueId: queue.id };
    } catch (e) {
      console.error('-=-= ERRO no método QueueService.addUser', e.data);

      if (e instanceof HttpException) throw e;

      throw new BadRequestException('Não foi possível entrar na fila');
    }
  }

  async removeUser(queueId: string, userId: string) {
    const queueMembers = await this.queueUserRepository.findBy({
      queueId,
      exited: false,
    });

    const memberToRemove = queueMembers.find(
      (member) => member.userId === userId,
    );

    if (!memberToRemove)
      return new NotFoundException('Usuário não está na fila');

    await this.queueUserRepository.manager.transaction(async (manager) => {
      queueMembers.forEach(async (queueMember) => {
        if (queueMember.userId === userId) return;

        if (queueMember.position > memberToRemove.position) {
          await manager.update(
            QueueUser,
            { userId: queueMember.userId },
            { position: queueMember.position - 1 },
          );
        }
      });

      await manager.update(
        QueueUser,
        { userId: memberToRemove.userId },
        { exited: true },
      );
    });
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

    return queueUsers
      .map((queueUser) => {
        const user = users.find((user) => user.id === queueUser.userId);

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          joined_at: queueUser.created_at,
          position: queueUser.position,
        };
      })
      .sort((curr, prev) => curr.position - prev.position);
  }

  private async validateUserAddition(queueCode: string, userId: string) {
    const queue = await this.queueRepository.findOneOrFail({
      where: { code: queueCode },
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

  private async generateNewCode(): Promise<string> {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    const randomInt = () => Math.floor(Math.random() * 10) + 1;

    let code = '';

    for (let i = 0; i < 6; i++) {
      if (i % 2) code += letters[randomInt()];
      else code += String(randomInt());
    }

    const queueWithSameCode = await this.queueRepository.findOneBy({ code });

    if (queueWithSameCode) return await this.generateNewCode();

    return code;
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
