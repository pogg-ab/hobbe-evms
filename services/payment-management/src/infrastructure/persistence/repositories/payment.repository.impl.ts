

import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { promises } from "dns";
import { Payments } from "src/domain/entities/payments.entity";
import { IPaymentsRepository } from "src/domain/repositories/payments/payments.repository";
import { KafkaProducerService } from "src/infrastructure/kafka/kafka.producer.servicce";
import { CreatePaymentDto } from "src/presentation/dtos/payments/create-payments.dto";
import { TransactionsVolumeByDateRangeDto } from "src/presentation/dtos/reports/trasaction-volume.dto";
import { IsNull, Not, Repository } from "typeorm";



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

   async findByExRef(ex_ref: string): Promise<Payments | null> {
       try {
        const payment = await this.paymentRepository.findOne({ where: { external_reference: ex_ref } });
          if (!payment) {
            throw new HttpException(
              `Payment with external reference ${ex_ref} not found`,
              HttpStatus.NOT_FOUND,
            );
          }
        return payment;
       } catch (error) {
        throw new HttpException(
            `Error finding payment by external reference: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
       }      
    }



     async findOneChapaPayment(tx_ref:string):Promise<Payments | null>{
          try {
            const chapa_payment = await this.paymentRepository.findOne({
              where: { tx_ref: tx_ref,payment_method:"Chapa" },
            });
      
            if (!chapa_payment) {
              throw new HttpException(
                `Payment with tx_ref ${tx_ref} not found`,
                HttpStatus.NOT_FOUND,
              );
            }
            return chapa_payment;
          } catch (error) {
            throw new HttpException(
              `Error fetching payment with tx_ref ${tx_ref}: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }

        async findOneStripePayment(tx_ref:string):Promise<Payments | null>{
          try {
            const stripe_payment = await this.paymentRepository.findOne({
              where: { tx_ref: tx_ref,payment_method:"Stripe" },
            });
      
            if (!stripe_payment) {
              throw new HttpException(
                `Payment with tx_ref ${tx_ref} not found`,
                HttpStatus.NOT_FOUND,
              );
            }
            return stripe_payment;
          } catch (error) {
            throw new HttpException(
              `Error fetching payment with tx_ref ${tx_ref}: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
    
    async verifyChapaPayment(payment_method:string,tx_ref:string,ex_ref:string,charge:string):Promise<any>{
      let paymentToBeVerify = null;
      try {
        switch (payment_method) {
          case "Chapa":
            paymentToBeVerify = await this.findOneChapaPayment(tx_ref);
            break;
          case "Stripe":
            paymentToBeVerify = await this.findOneStripePayment(tx_ref);
            break;
          default:
            return new HttpException(
              `Payment method ${payment_method} not supported`,
              HttpStatus.BAD_REQUEST,
            );
        }
  
       paymentToBeVerify.verified_at = new Date();
       paymentToBeVerify.payment_status = "success";
       paymentToBeVerify.external_reference = ex_ref;
       paymentToBeVerify.charge = charge;
  
       const paymentStatus =  await this.paymentRepository.save(paymentToBeVerify);
       await this.kafkaProducerService.produce({
        topic: 'payment_status',
        messages: [{ value: JSON.stringify(paymentToBeVerify) }],
      });  
      
      return {message :"Payment verified successfully",paymentStatus};
      
      } catch (error) {
        throw new HttpException(
          `Error updating bank account: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }


    async changePaymentStatus(id:string,status:string):Promise<Payments | null>{
      try {
        const payment = await this.paymentRepository.findOne({ where: { id: id} });
        if (!payment) {
          throw new HttpException(
            `Payment with ID ${id} not found`,
            HttpStatus.NOT_FOUND,
          );
        }

        payment.payment_status = status;
        const updatedPayment = await this.paymentRepository.save(payment);
        return updatedPayment;
      } catch (error) {
        throw new HttpException(
          `Error updating payment status: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );  
      }
    }

    async findByEventIdToCancelEvent(event_id: string): Promise<Payments[] | []> {
      try {
        const payments = await this.paymentRepository.find(
          {
             where: {
              event_id: event_id,
              payment_method:"Chapa",
              payment_status:"success",
              verified_at: Not(IsNull())
            } 
          });
      
        if (payments.length === 0) {
          throw new HttpException(
            `No successful payments on eligibale to refund payments found for event ID ${event_id}`,
            HttpStatus.NOT_FOUND,
          );
        }
        return payments;
      } catch (error) {
        throw new HttpException(
          `Error finding payment by event ID: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } 
    }



    async getCurrentMonthTransactions(): Promise<any> {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
  
      return this.paymentRepository
        .createQueryBuilder('p')
        .select('COUNT(*)', 'total_transactions')
        .addSelect('SUM(p.amount)', 'total_value')
        .where('p.verified_at IS NOT NULL')
        .andWhere('p.verified_at BETWEEN :start AND :end', { start, end })
        .getRawOne();
    }
  
    async getTodayTransactions(): Promise<any> {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
  
      return this.paymentRepository
        .createQueryBuilder('p')
        .select('COUNT(*)', 'total_transactions')
        .addSelect('SUM(p.amount)', 'total_value')
        .where('p.verified_at IS NOT NULL')
        .andWhere('p.verified_at BETWEEN :start AND :end', { start, end })
        .getRawOne();
    }

    async getLastMonthTransactions(): Promise<any> {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
    
      return this.paymentRepository
        .createQueryBuilder('p')
        .select('COUNT(*)', 'total_transactions')
        .addSelect('SUM(p.amount)', 'total_value')
        .where('p.verified_at IS NOT NULL')
        .andWhere('p.verified_at BETWEEN :start AND :end', { start, end })
        .getRawOne();
    }
    
    async getYesterdayTransactions(): Promise<any> {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
    
      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    
      return this.paymentRepository
        .createQueryBuilder('p')
        .select('COUNT(*)', 'total_transactions')
        .addSelect('SUM(p.amount)', 'total_value')
        .where('p.verified_at IS NOT NULL')
        .andWhere('p.verified_at BETWEEN :start AND :end', { start, end })
        .getRawOne();
    }

    async getTransactionVolumeByDateRange(daterange: TransactionsVolumeByDateRangeDto): Promise<any> {
      const { startDate, endDate } = daterange;
      if (!startDate || !endDate) {
        throw new HttpException(
          'Start date and end date are required',
          HttpStatus.BAD_REQUEST,
        );
      }


      const aggregated = this.paymentRepository
        .createQueryBuilder('p')
        .select('COUNT(*)', 'total_transactions')
        .addSelect('SUM(p.amount)', 'total_value')
        .where('p.verified_at IS NOT NULL')
        .andWhere('p.verified_at BETWEEN :start AND :end', {
          start: new Date(startDate),
          end: new Date(endDate),
        })
        .getRawOne();

        // i wanna add lists of transactions
      const transactions = this.paymentRepository
        .createQueryBuilder('p')
        .where('p.verified_at IS NOT NULL')
        .andWhere('p.verified_at BETWEEN :start AND :end', {
          start: new Date(startDate),
          end: new Date(endDate),
        })
        .getMany();

      return Promise.all([aggregated, transactions]).then(([aggregatedResult, transactionsList]) => {
        return {
          total_transactions: aggregatedResult.total_transactions,
          total_value: aggregatedResult.total_value,
          transactions: transactionsList,
        };
      }
      );
    }


    async getAggregatedTransactionVolume(aggregatedTransactionVolumeDto: any): Promise<any> {
      const { startDate, endDate } = aggregatedTransactionVolumeDto;
      if (!startDate || !endDate) {
        throw new HttpException(
          'Start date and end date are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.paymentRepository
        .createQueryBuilder('p')
        .select('DATE_TRUNC(:aggregationType, p.verified_at)', 'date')
        .addSelect('COUNT(*)', 'total_transactions')
        .addSelect('SUM(p.amount)', 'total_value')
        .where('p.verified_at IS NOT NULL')
        .andWhere('p.verified_at BETWEEN :start AND :end', {
          start: new Date(startDate),
          end: new Date(endDate),
        })
        .groupBy('date')
        .setParameter('aggregationType', aggregatedTransactionVolumeDto.aggregationType)
        .getRawMany();
    }

    async findByTxRef(txRef: string): Promise<Payments | null> {
    try {
      return await this.paymentRepository.findOne({
        where: { tx_ref: txRef },
      });
    } catch (error) {
      // It's good practice to log errors at the repository level
      console.error(`Error finding payment by tx_ref ${txRef}:`, error);
      throw new InternalServerErrorException('Database query for payment by tx_ref failed.');
    }
  }
    
}
