import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/domain/entities/role.entity';
import { Repository } from 'typeorm';
import { GetRoleByIdQuery } from '../../queries/role-permission/get-role-by-id.query';
import { NotFoundException } from '@nestjs/common';
import { GetRoleDto } from 'src/presentation/dtos/get-role.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';

@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdQueryHandler implements IQueryHandler<GetRoleByIdQuery, GetRoleDto> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async execute(query: GetRoleByIdQuery): Promise<GetRoleDto> {
    // 1. The 'relations' query is corrected to use the new entity structure.
    const roleFromDb = await this.roleRepository.findOne({
      where: { role_id: query.id },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    if (!roleFromDb) {
      throw new NotFoundException(`Role with ID "${query.id}" not found`);
    }

    // 2. We map the single entity object into our clean DTO.
    return this.mapper.map(roleFromDb, Role, GetRoleDto);
  }
}