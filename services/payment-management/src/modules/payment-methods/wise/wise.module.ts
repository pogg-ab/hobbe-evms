import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- 1. IMPORT
import { WiseService } from 'src/application/services/payment-methods/wise/wise.service';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';
import { WiseController } from 'src/presentation/controllers/payment-methods/wise/wise.controller';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuditLogModule,
    // --- 2. THIS IS THE FIX ---
    // This makes the 'KAFKA_PRODUCER' provider available for injection.
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER', // Must match the @Inject() token
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-management-producer',
            brokers: [process.env.KAFKA_BROKER],
          },
        },
      },
    ]),
    // Note: The original 'WiseModule' import here was a circular dependency.
    // A module should not import itself.
  ],
  controllers: [WiseController],
  providers: [WiseService,],
})
export class WiseModule {}