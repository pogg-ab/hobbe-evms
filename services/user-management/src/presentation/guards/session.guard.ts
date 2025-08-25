import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { UserSession } from 'src/domain/entities/user-session.entity';
import { Repository } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const SESSION_TIMEOUT_MINUTES = 1; // Set low for testing

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return true; // Let AuthGuard run first

    const sessionId = user.jti;
    if (!sessionId) {
      throw new UnauthorizedException('Session ID (jti) is missing from token.');
    }

    const session = await this.sessionRepository.findOne({ where: { session_id: sessionId } });
    if (!session || !session.is_active) {
      throw new UnauthorizedException('Session is invalid or has been terminated.');
    }

    const now = new Date();
    const lastActivity = new Date(session.last_activity);
    const timeDifferenceMinutes = (now.getTime() - lastActivity.getTime()) / 60000;

    if (timeDifferenceMinutes > SESSION_TIMEOUT_MINUTES) {
      session.is_active = false;
      await this.sessionRepository.save(session);
      throw new UnauthorizedException('Session has expired due to inactivity.');
    }

    session.last_activity = new Date();
    await this.sessionRepository.save(session);

    return true;
  }
}