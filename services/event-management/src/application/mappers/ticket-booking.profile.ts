import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { CreateTicketBookingDto } from 'src/presentation/dtos/tickets/create-ticket-booking.dto';

@Injectable()
export class TicketBookingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateTicketBookingDto,
        TicketBooking,
        forMember(
          (destination) => destination.event_id,
          mapFrom((source) => source.event_id),
        ),
        forMember(
          (destination) => destination.booking_type,
          mapFrom((source) => source.booking_type),
        ),
        forMember(
          (destination) => destination.total_amount,
          mapFrom((source) => source.total_amount),
        ),
        forMember(
          (destination) => destination.booking_status,
          mapFrom(() => 'Pending'),
        ),
        forMember(
          (destination) => destination.hasGift,
          mapFrom((source) => source.hasGift),
        ),
        forMember(
          (destination) => destination.hasPromocode,
          mapFrom((source) => source.hasPromocode),
        ),
        forMember(
          (destination) => destination.hasPayment,
          mapFrom((source) => source.hasPayment),
        ),
        forMember(
          (destination) => destination.is_partnership,
          mapFrom((source) => source.is_partnership),
        ),
      );

      createMap(
        mapper,
        CreateTicketBookingDto,
        BookingHasPayment,
        forMember(
          (destination) => destination.payment_method,
          mapFrom((source) => source.payment_method),
        ),
        forMember(
          (destination) => destination.total_amount,
          mapFrom((source) => source.total_price),
        ),
      );
    };
  }
}
