// In src/presentation/guards/admin-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminAuthGuard extends AuthGuard('admin-jwt') {} // <-- Tell it to use our new strategy