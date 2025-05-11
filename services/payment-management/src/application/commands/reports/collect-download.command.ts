import { CreateDownloadDto } from "src/presentation/dtos/reports/create-download.dto";


export class CollectDownloadCommand {
    constructor( public readonly dto: CreateDownloadDto) {}
}