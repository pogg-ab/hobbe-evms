import { E2EE } from "src/domain/entities/e2ee.entity"


export interface IE2EERepository {
    create(e2ee:E2EE):Promise<E2EE>
    getKeyPair(user_id:string):Promise<E2EE | null>
    getPublicKey(user_id:string):Promise<{publicKey:String}>
    getPrivateKey(user_id:string):Promise<{privateKey:String}>
}