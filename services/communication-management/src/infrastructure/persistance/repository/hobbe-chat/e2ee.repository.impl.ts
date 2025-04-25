import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { E2EE } from "src/domain/entities/hobbe-chat/e2ee.entity";
import { IE2EERepository } from "src/domain/repositories/hobbe-chat/e2ee/e2ee.repository";
import { Repository, Equal, FindOneOptions } from "typeorm";



@Injectable()

export class E2EERepositoryImpl implements IE2EERepository{

    constructor(
        @InjectRepository(E2EE)
        private readonly e2eeRepository : Repository<E2EE>
    ){}
    

    async create(e2ee: E2EE):Promise<E2EE>{
        return this.e2eeRepository.save(e2ee);
    }



    // ... rest of your imports
    
    async findOne(userId: string): Promise<E2EE | null> {
        try {
            const findOptions: FindOneOptions<E2EE> = {
                where: {
                    user: Equal(userId)  // Use Equal operator for the relation
                },
                relations: ['user']  // Include the relation to ensure it's loaded
            };
    
            const keyPair = await this.e2eeRepository.findOne(findOptions);
    
            if (!keyPair) {
                // console.log(`No E2EE key pair found for user ID: ${userId}`);
                return null;
            }

            // console.log(`Found E2EE key pair for user ID: ${userId}`, {
            //     id: keyPair.id,
            //     userId: keyPair.user,  // Access the id from the related user
            //     hasPublicKey: !!keyPair.public_key,
            //     hasPrivateKey: !!keyPair.private_key
            // });
    
            return keyPair;
        } catch (error) {
            console.error(`Error finding E2EE key pair for user ID: ${userId}`, error);
            throw error;
        }
    }
    async getPublicKey(userId: string):Promise<{publicKey:string} | null>{    
        const keyPair =  await this.e2eeRepository.findOne({
            where: {
                user: Equal(userId)  // Use Equal operator for the relation
            },
        });
        if(!keyPair){
            return null;
        }
        return {publicKey:keyPair.public_key};
    }

    async getPrivateKey(userId: string):Promise<{privateKey:string}| null>{
        const keyPair =  await this.e2eeRepository.findOne({
            where: {
                user: Equal(userId)  // Use Equal operator for the relation
            },
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