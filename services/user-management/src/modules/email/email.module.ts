import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendEmailHandler } from 'src/application/handlers/email/send-email.command-handler';
import { EmailProfile } from 'src/application/mappers/email.profile';
import { EmailService } from 'src/application/services/email.service';
import { Email } from 'src/domain/entities/email.entity';
import { EMAIL_REPOSITORY_TOKEN } from 'src/domain/repositories/email.repository.token';
import { EmailSenderService } from '../../infrastructure/email/email-sender.service';
import { EmailRepositoryImpl } from '../../infrastructure/persistence/repositories/email.repository.impl';

@Module({
  imports: [AutomapperModule, CqrsModule, TypeOrmModule.forFeature([Email])],
  providers: [
    EmailProfile,
    {
      provide: EMAIL_REPOSITORY_TOKEN,
      useClass: EmailRepositoryImpl,
    },
    EmailService,
    EmailSenderService,
    SendEmailHandler,
    EmailRepositoryImpl,
  ],
  exports: [EMAIL_REPOSITORY_TOKEN, EmailRepositoryImpl, EmailSenderService],
})
export class EmailModule {}
