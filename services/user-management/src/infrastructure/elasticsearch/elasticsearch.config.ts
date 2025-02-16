import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchConfig {
    private readonly client: Client;

    constructor() {
        const username = process.env.ELASTICSEARCH_USERNAME || 'elastic';
        const password = process.env.ELASTICSEARCH_PASSWORD;
        const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

        this.client = new Client({
            node: node,
            auth: {
                username: username,
                password: password,
            },
        });


    }


    getClient() {
        return this.client;
    }
}
