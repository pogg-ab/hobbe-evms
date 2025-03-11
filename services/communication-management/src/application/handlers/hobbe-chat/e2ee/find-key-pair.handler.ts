import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindKeyPairQuery } from "src/application/queries/hobbe-chat/e2ee/find-key-pair.query";
import { E2eeService } from "src/application/services/hobbe-chat/e2ee/e2ee.service";


@QueryHandler(FindKeyPairQuery)

export class FindKeyPairQueryHandler implements IQueryHandler<FindKeyPairQuery> {
    constructor(
        private readonly e2eeSerive: E2eeService
    ){}

    async execute(query: FindKeyPairQuery): Promise<{publicKey:String}> {
        return await this.e2eeSerive.getPublicKey(query.user);
    }
}