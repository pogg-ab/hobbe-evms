// src/domain/entities/user.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from '../value-objects/address.value-object';
import { Email } from '../value-objects/email.value-object';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column('json')
  address: Address;

  constructor(
    name: string,
    email: string,
    phoneNumber: string,
    address: Address,
  ) {
    this.name = name;
    this.email = new Email(email).toString();
    this.phoneNumber = phoneNumber;
    this.address = address;
  }
}
