import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promocodes } from 'src/domain/entities/promocodes.entity';
import { IPromocode } from 'src/domain/repositories/tickets/promocode.repository';
import { CreatePromocodeDto } from 'src/presentation/dtos/tickets/create-promocode.dto';
import { Repository } from 'typeorm';

@Injectable()
export class PromocodeRepositoryImpl implements IPromocode {
  constructor(
    @InjectRepository(Promocodes)
    private promocodeRepository: Repository<Promocodes>,
  ) { }
  async create(createPromocodeDto: CreatePromocodeDto): Promise<Promocodes> {
    try {
      const newPromocode = this.promocodeRepository.create(createPromocodeDto);
      return await this.promocodeRepository.save(newPromocode);
    } catch (error) {
      throw new HttpException(
        `Error creating Promocode: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Promocodes[]> {
    try {
      return await this.promocodeRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching Promocode ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Promocodes> {
    try {
      const promocode = await this.promocodeRepository.findOne({
        where: { id: id },
      });

      if (!promocode) {
        throw new HttpException(
          `Promocode with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return promocode;
    } catch (error) {
      throw new HttpException(
        `Error fetching promocode with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCode(code: string, eventId: any): Promise<Promocodes | null> {
    try {
      const promocode = await this.promocodeRepository.findOne({
        where: { code: code, event_id: { id: eventId }, status: 'Active' },
        relations: ['event_id'],
      });

      return promocode;
    } catch (error) {
      throw new HttpException(
        `Error fetching promocode with code ${code} for event ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, promocode: Promocodes): Promise<Promocodes> {
    try {
      const promocodeToBeUpdate = await this.findOne(id);

      const updatedPromocode = Object.assign(promocodeToBeUpdate, promocode);

      return await this.promocodeRepository.save(updatedPromocode);
    } catch (error) {
      throw new HttpException(
        `Error Updating Promocode: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEventId(eventId: string): Promise<Promocodes | null> {
    try {
      const promocode = await this.promocodeRepository.findOne({
        where: {
          event_id: { id: eventId },
        },
        relations: ['event_id'],
      });

      return promocode;
    } catch (error) {
      throw new HttpException(
        `Error fetching promocode for event ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
