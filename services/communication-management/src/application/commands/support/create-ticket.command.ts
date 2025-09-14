export interface FileStream {
    filename: string;
    buffer: Uint8Array;
    contentType: string;
    size: number;
}
export class CreateTicketCommand {
    constructor(
        public readonly subject: string,
        public readonly description: string,
        public readonly email: string,
        public readonly priority: number,
        public readonly status: number,
        public readonly attachments: FileStream[] = [],
    ) { }
}