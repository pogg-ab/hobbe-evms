import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs'; // <-- ADD EventBus
import { CreatePermissionCommand } from 'src/application/commands/role-permission/create-permission.command';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { PermissionCreatedEvent } from '../../domain-events/permission-created.event'; // <-- IMPORT THE NEW EVENT

@CommandHandler(CreatePermissionCommand)
export class CreatePermissionCommandHandler
  implements ICommandHandler<CreatePermissionCommand>
{
  constructor(
    private readonly adminService: AdminService,
    // --- 1. INJECT THE EVENTBUS ---
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreatePermissionCommand): Promise<Permission> {
    const { createPermissionDto } = command;

    // --- YOUR EXISTING, WORKING CODE ---
    // This line remains exactly the same.
    const savedPermission = await this.adminService.addPermission(createPermissionDto);
    // --- END OF EXISTING CODE ---

    // --- 2. PUBLISH THE EVENT AFTER THE SERVICE SUCCEEDS ---
    // We use the result from the service to create the event.
    this.eventBus.publish(new PermissionCreatedEvent(savedPermission));

    return savedPermission;
  }
}