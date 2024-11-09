import { Owner } from '../entities/owner.entity';

export interface IOwnerRepository {
  create(owner: Owner): Promise<Owner>;
  findOneById(ownerId: string): Promise<Owner | null>;
  update(ownerId: string, owner: Owner): Promise<Owner>;
  remove(ownerId: string): Promise<void>;
}
