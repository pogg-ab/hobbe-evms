import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { E2EE } from 'src/domain/entities/e2ee.entity';
import { IE2EERepository } from 'src/domain/repositories/e2ee/e2ee.repository';
import { E2EE_REPOSITORY_TOKEN } from 'src/domain/repositories/e2ee/e2ee.repository.token';
import { E2EEDto } from 'src/presentation/dto/e2ee/create.e2ee.dto';
import * as crypto from 'crypto';
import { firebaseDatabase } from 'src/infrastructure/firebase/firebase.config';

@Injectable()
export class E2eeService {
  constructor(
    @Inject(E2EE_REPOSITORY_TOKEN)
    private readonly E2EERepository: IE2EERepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

    private firebase_db = firebaseDatabase.ref('HobbeChats'); 
  
  
  async storeKeyPair(e2eeDto:E2EEDto): Promise<E2EE> {
    const mappedE2EE = this.mapper.map(e2eeDto, E2EEDto, E2EE);
    return await this.E2EERepository.create(mappedE2EE);
  }

  async getPublicKey(user_id:string): Promise<{publicKey:String}> {
      const keys =  await this.E2EERepository.getPublicKey(user_id);
    if(!keys){
      const keyPair = this.generateKeyPair();
      const key = {...keyPair, user_id:user_id};      
      const keys = await this.storeKeyPair(key);
      return {publicKey:keys.public_key};
    };
    // const keyPair =  await this.E2EERepository.getKeyPair(user_id)
    return {publicKey:keys.publicKey};
  }

  async getPrivateKey(user_id:string): Promise<{privateKey:String}> {
    const keys =  await this.E2EERepository.getPrivateKey(user_id);
   if(!keys){
    const keyPair = this.generateKeyPair();
    const key = {...keyPair, user_id:user_id};      
    const keys = await this.storeKeyPair(key);
    return {privateKey:keys.private_key};
  };
  return {privateKey:keys.privateKey};
}



   generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  encrypt(publicKey: string, message: string): string {
    const buffer = Buffer.from(message, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  }

  decrypt(privateKey: string, encryptedMessage: string): string {
    const buffer = Buffer.from(encryptedMessage, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
  }
}
