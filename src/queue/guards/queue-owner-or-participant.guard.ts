import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../queue.service';

@Injectable()
export class QueueOwnerOrParticipantGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    let userId: string;

    if (req.query.userId) userId = req.query.userId;
    if (req.body.userId) userId = req.body.userId;

    if (!userId) return false;

    const { id } = req.params;

    try {
      const queue = await this.queueService.findById(id);

      if (!queue) throw new NotFoundException('Fila não foi encontrada');

      const participants = await this.queueService.findParticipantsByQueueId(
        queue.id,
      );

      const isOwner = queue.ownerId === userId;
      const isParticipant = !!participants.find(
        (participant) => participant.userId === userId,
      );

      if (!isOwner && !isParticipant) throw new Error();
    } catch (e) {
      if (e instanceof HttpException) throw e;

      throw new ForbiddenException('Ação indisponível');
    }

    return true;
  }
}
