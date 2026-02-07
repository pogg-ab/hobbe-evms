import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// --- IMPORT THE TWO SEPARATE SESSION ENTITIES ---
import { UserSession } from 'src/domain/entities/user-session.entity';
import { AdminUserSession } from 'src/domain/entities/admin-user-session.entity';

// --- Set the timeout to 15 minutes as requested ---
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

@Injectable()
export class SessionGuard implements CanActivate {
  // --- INJECT BOTH REPOSITORIES ---
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepo: Repository<UserSession>,
    @InjectRepository(AdminUserSession)
    private readonly adminSessionRepo: Repository<AdminUserSession>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPayload = request.user; // Attached by the JWT strategy

    if (!userPayload || !userPayload.jti) {
      // This case should be handled by the preceding JWT/Auth guard.
      // If it gets here, something is misconfigured. Deny access.
      throw new UnauthorizedException('Authentication token is missing required session information.');
    }

    const sessionId = userPayload.jti;
    const now = new Date();
    let session: UserSession | AdminUserSession;

    // --- LOGIC TO CHECK THE CORRECT TABLE ---
    // We use the `isAdmin` flag that we added to the admin JWT payload.
    if (userPayload.isAdmin) {
      session = await this.adminSessionRepo.findOneBy({ session_id: sessionId });
    } else {
      session = await this.userSessionRepo.findOneBy({ session_id: sessionId });
    }

    if (!session || !session.is_active) {
      throw new UnauthorizedException('Session is invalid or has been terminated.');
    }

    // --- AUTOMATIC TIMEOUT LOGIC (using milliseconds is more precise) ---
    const timeSinceLastActivity = now.getTime() - new Date(session.last_activity).getTime();
    if (timeSinceLastActivity > INACTIVITY_TIMEOUT_MS) {
      session.is_active = false;
      // Save the change back to the correct repository
      if (userPayload.isAdmin) {
        await this.adminSessionRepo.save(session as AdminUserSession);
      } else {
        await this.userSessionRepo.save(session as UserSession);
      }
      throw new UnauthorizedException('Session has expired due to inactivity.');
    }

    
    session.last_activity = now;
    if (userPayload.isAdmin) {
      await this.adminSessionRepo.save(session as AdminUserSession);
    } else {
      await this.userSessionRepo.save(session as UserSession);
    }

    return true;
  }
}