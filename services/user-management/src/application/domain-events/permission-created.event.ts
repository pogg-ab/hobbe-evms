import { Permission } from 'src/domain/entities/permission.entity';

export class PermissionCreatedEvent {
  constructor(
    /**
     * The event carries the newly created permission entity.
     */
    public readonly permission: Permission,
  ) {}
}