import { EntityManager } from 'typeorm';
import { Owner } from '../entities/owner.entity';

export interface IOwnerRepository {
  create(manager: EntityManager, owner: Owner): Promise<Owner>;
  findOneById(ownerId: string): Promise<Owner | null>;
  update(ownerId: string, owner: Owner): Promise<Owner>;
  remove(ownerId: string): Promise<void>;
}
