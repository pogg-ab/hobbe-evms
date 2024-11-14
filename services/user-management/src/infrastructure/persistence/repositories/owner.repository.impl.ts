import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Owner } from 'src/domain/entities/owner.entity';
import { IOwnerRepository } from 'src/domain/repositories/owner.repository';
import { Repository } from 'typeorm';

@Injectable()
export class OwnerRepositoryImpl implements IOwnerRepository {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async create(owner: Owner): Promise<Owner> {
    try {
      const newOwner = this.ownerRepository.create(owner);
      return await this.ownerRepository.save(newOwner);
    } catch (error) {
      throw new HttpException(
        `Error creating Owner: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(ownerId: string): Promise<Owner | null> {
    try {
      return await this.ownerRepository.findOne({
        where: { owner_id: ownerId },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Owner: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(ownerId: string, owner: Owner): Promise<Owner> {
    try {
      await this.ownerRepository.update(ownerId, owner);
      return await this.ownerRepository.findOne({
        where: { owner_id: ownerId },
      });
    } catch (error) {
      throw new HttpException(
        `Error updating Owner: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(ownerId: string): Promise<void> {
    try {
      await this.ownerRepository.delete(ownerId);
    } catch (error) {
      throw new HttpException(
        `Error deleting Owner: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
