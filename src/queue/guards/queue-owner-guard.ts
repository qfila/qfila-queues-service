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
export class QueueOwnerGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    let userId: string;

    if (req.query.userId) userId = req.query.userId;
    if (req.body.userId) userId = req.body.userId;
    if (req.params.userId) userId = req.params.userId;
    if (req.query.ownerId) userId = req.query.ownerId;

    if (!userId) return false;

    const { id } = req.params;

    try {
      const queue = await this.queueService.findById(id);

      if (!queue) throw new NotFoundException('Fila não foi encontrada');

      if (queue.ownerId !== userId) throw new Error();
    } catch (e) {
      if (e instanceof HttpException) throw e;

      throw new ForbiddenException('Ação indisponível');
    }

    return true;
  }
}
