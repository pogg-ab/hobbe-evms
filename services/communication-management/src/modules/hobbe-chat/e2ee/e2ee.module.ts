import { AutomapperModule } from "@automapper/nestjs";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreateE2EECommandHandler } from "src/application/handlers/hobbe-chat/e2ee/create-e2ee.handler";
import { FindKeyPairQueryHandler } from "src/application/handlers/hobbe-chat/e2ee/find-key-pair.handler";
import { E2EEProfile } from "src/application/mappers/e2ee.profile";
import { E2eeService } from "src/application/services/hobbe-chat/e2ee/e2ee.service";
import { E2EE } from "src/domain/entities/hobbe-chat/e2ee.entity";
import { E2EE_REPOSITORY_TOKEN } from "src/domain/repositories/hobbe-chat/e2ee/e2ee.repository.token";
import { E2EERepositoryImpl } from "src/infrastructure/persistance/repository/hobbe-chat/e2ee.repository.impl";

@Module({
  
    imports: [
      AutomapperModule,
      TypeOrmModule.forFeature([E2EE]),
      CqrsModule,
    ],
    controllers: [],
    providers: [
      E2eeService,
      E2EEProfile,
      CreateE2EECommandHandler,
      FindKeyPairQueryHandler,
    
      {
        provide: E2EE_REPOSITORY_TOKEN,
        useClass: E2EERepositoryImpl,
      },
    ],
    exports: [E2eeService,E2EE_REPOSITORY_TOKEN], // Export for use in other modules
  })
  export class E2EEModule {}
  
