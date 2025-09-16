import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Agent } from 'src/domain/entities/support/agent.entity';
import { CreateAgentDto } from 'src/presentation/dto/support/agent/agent.dto';
import { UpdateAgentDto } from 'src/presentation/dto/support/agent/agent.dto';

@Injectable()
export class AgentProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            // CreateAgentDto -> Agent
            createMap(
                mapper,
                CreateAgentDto,
                Agent,
                forMember(
                    (destination) => destination.name,
                    mapFrom((src) => src.name),
                ),
                forMember(
                    (destination) => destination.email,
                    mapFrom((src) => src.email),
                ),
                forMember(
                    (destination) => destination.role,
                    mapFrom((src) => src.role),
                ),
                forMember(
                    (destination) => destination.available,
                    mapFrom((src) => src.available),
                ),
                forMember(
                    (destination) => destination.createdAt,
                    mapFrom(() => new Date()),
                ),
                forMember(
                    (destination) => destination.updatedAt,
                    mapFrom(() => new Date()),
                ),
            );

            // UpdateAgentDto -> Agent (partial mapping)
            createMap(
                mapper,
                UpdateAgentDto,
                Agent,
                forMember(
                    (destination) => destination.name,
                    mapFrom((src) => src.name),
                ),
                forMember(
                    (destination) => destination.email,
                    mapFrom((src) => src.email),
                ),
                forMember(
                    (destination) => destination.role,
                    mapFrom((src) => src.role),
                ),
                forMember(
                    (destination) => destination.available,
                    mapFrom((src) => src.available),
                ),
                forMember(
                    (destination) => destination.updatedAt,
                    mapFrom(() => new Date()),
                ),
            );
        };
    }
}