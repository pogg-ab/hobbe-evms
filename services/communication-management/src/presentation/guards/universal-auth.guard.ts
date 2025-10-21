import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UniversalAuthGuard extends AuthGuard(['jwt', 'admin-jwt']) {}
