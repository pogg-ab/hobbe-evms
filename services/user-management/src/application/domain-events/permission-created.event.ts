import { Permission } from 'src/domain/entities/permission.entity';

export class PermissionCreatedEvent {
  constructor(public readonly permission: Permission) {}
}
