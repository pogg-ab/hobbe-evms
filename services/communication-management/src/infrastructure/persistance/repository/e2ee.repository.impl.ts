import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { E2EE } from "src/domain/entities/e2ee.entity";
import { IE2EERepository } from "src/domain/repositories/e2ee/e2ee.repository";
import { Repository } from "typeorm";


@Injectable()

export class E2EERepositoryImpl implements IE2EERepository{

    constructor(
        @InjectRepository(E2EE)
        private readonly e2eeRepository : Repository<E2EE>
    ){}
    

    async create(e2ee: E2EE):Promise<E2EE>{
        return this.e2eeRepository.save(e2ee);
    }

    async getKeyPair(user_id: string):Promise<E2EE | null>{
        const keyPair =  await this.e2eeRepository.findOne({
            where:{user_id:user_id}
        });

        return keyPair;
    }

    async getPublicKey(user_id: string):Promise<{publicKey:string} | null>{
        const keyPair =  await this.e2eeRepository.findOne({
            where:{user_id:user_id}
        });
        if(!keyPair){
            return null;
        }
        return {publicKey:keyPair.public_key};
    }

    async getPrivateKey(user_id: string):Promise<{privateKey:string}| null>{
        const keyPair =  await this.e2eeRepository.findOne({
            where:{user_id:user_id}
        });
        if(!keyPair){
            return null;
        }
        return {privateKey:keyPair.private_key};
    }


    // async findAll() :Promise<Categories[]>{
    //     return await this.categoriesRepository.find();
    // }


    
}