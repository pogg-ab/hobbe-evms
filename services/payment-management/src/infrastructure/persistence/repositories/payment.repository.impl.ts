

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { promises } from "dns";
import { Payments } from "src/domain/entities/payments.entity";
import { IPaymentsRepository } from "src/domain/repositories/payments/payments.repository";
import { KafkaProducerService } from "src/infrastructure/kafka/kafka.producer.servicce";
import { CreatePaymentDto } from "src/presentation/dtos/payments/create-payments.dto";
import { Repository } from "typeorm";



@Injectable()
export class PaymentRepositoryImpl implements IPaymentsRepository{
    constructor(
        @InjectRepository(Payments)
        private paymentRepository: Repository<Payments>,
        private readonly kafkaProducerService: KafkaProducerService,
        
    ){}
    async create(createPaymentDto: CreatePaymentDto): Promise<Payments> {
        try {
            const newPayment = this.paymentRepository.create(createPaymentDto);
            const payment = await this.paymentRepository.save(newPayment);
            return payment;
          } catch (error) {
            throw new HttpException(
              `Error creating payments : ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
    }



     async findOneChapa(tx_ref:string):Promise<Payments | null>{
          try {
            const bank_account = await this.paymentRepository.findOne({
              where: { tx_ref: tx_ref,payment_method:"Chapa" },
            });
      
            if (!bank_account) {
              throw new HttpException(
                `Payment with tx_ref ${tx_ref} not found`,
                HttpStatus.NOT_FOUND,
              );
            }
            return bank_account;
          } catch (error) {
            throw new HttpException(
              `Error fetching payment with tx_ref ${tx_ref}: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
    
    async verifyChapaPayment(tx_ref:string,charge:string):Promise<void>{
      try {
        const paymentToBeVerify = await this.findOneChapa(tx_ref);
  
       paymentToBeVerify.verified_at = new Date();
       paymentToBeVerify.payment_status = "success";
       paymentToBeVerify.charge = charge;
  
       const paymentStatus =  await this.paymentRepository.save(paymentToBeVerify);
       await this.kafkaProducerService.produce({
        topic: 'payment_status',
        messages: [{ value: JSON.stringify(paymentToBeVerify) }],
      });   
      
      } catch (error) {
        throw new HttpException(
          `Error updating bank account: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
}
