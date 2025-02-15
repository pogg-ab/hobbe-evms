import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchConfig {
    private readonly client: Client;

    constructor() {
        this.client = new Client({
            node: 'http://localhost:9200',
        });
    }

    getClient() {
        return this.client;
    }
}
