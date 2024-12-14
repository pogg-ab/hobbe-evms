import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { Promocodes } from 'src/domain/entities/promocodes.entity';
import { IPromocode } from 'src/domain/repositories/tickets/promocode.repository';
import { CREATE_PROMOCODE_TOKEN } from 'src/domain/repositories/tickets/promocode.repository.token';
import { CreatePromocodeDto } from 'src/presentation/dtos/tickets/create-promocode.dto';

@Injectable()
export class PromocodeServices {
  constructor(
    @Inject(CREATE_PROMOCODE_TOKEN)
    private readonly createPromocodeRepository: IPromocode,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(createPromocodeDto: CreatePromocodeDto): Promise<Promocodes> {
    const promocode = this.mapper.map(
      createPromocodeDto,
      CreatePromocodeDto,
      Promocodes,
    );
    return await this.createPromocodeRepository.create(promocode);
  }

  async findOne(id: number): Promise<Promocodes | null> {
    return await this.createPromocodeRepository.findOne(id);
  }

  async update(
    id: number,
    promocode: Promocodes,
  ): Promise<Promocodes> {
    return await this.createPromocodeRepository.update(id, promocode);
  }
}
export class Promocode {}
