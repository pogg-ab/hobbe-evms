import { Events } from "src/domain/entities/events.entity";
import { CreateTicketsDto } from "src/presentation/dtos/tickets/create-tickets.dto";
import { v4 as uuidv4 } from 'uuid';
import * as qrcode from 'qrcode';
import { Injectable } from "@nestjs/common";

@Injectable()
export class CustomEventTicketMapper{
    constructor(){}

   async map( 
    event:Events,
    createTicketsDto:CreateTicketsDto,
    type:string):Promise<CreateTicketsDto>{
     // Generate a unique ticket number (UUID)
     const ticketNumber = uuidv4();
     // Generate the QR Code based on the ticket number
     const qrCode = await qrcode.toDataURL(`http://localhost:4001/tickets/get/ticket-info/${ticketNumber}`);

     // Create the ticket DTO and assign values
     const ticketDto = createTicketsDto;
     ticketDto.price = event.ticket_heading.price;
     ticketDto.event_id = event.id;
     ticketDto.type = type;
     ticketDto.ticket_heading_id = event.ticket_heading.id;
     ticketDto.qr_code = qrCode; // Assign the generated QR code
     ticketDto.ticket_no = ticketNumber; // Assign the ticket number

     return ticketDto;
   }


}