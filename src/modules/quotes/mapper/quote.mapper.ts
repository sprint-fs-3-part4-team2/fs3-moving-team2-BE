import { QuoteRequestAddress, QuoteMatch } from '@prisma/client';
import { QuoteForCustomerDto } from '../dto/quoteForCustomer.dto';
import { MOVE_TYPE } from '@/constants/serviceType';
import { QuoteForMoverDto } from '../dto/quoteForMover.dto';

export default class QuoteMapper {
  static mapAddress(
    address: QuoteRequestAddress,
  ): Omit<QuoteRequestAddress, 'id' | 'quoteRequestId' | 'type'> {
    return {
      sido: address.sido,
      sigungu: address.sigungu,
      street: address.street,
      fullAddress: address.fullAddress,
    };
  }

  static extractAddresses(quoteAddresses: QuoteRequestAddress[]) {
    const arrivalAddress = quoteAddresses.find((address) => address.type === 'ARRIVAL');
    const departureAddress = quoteAddresses.find((address) => address.type === 'DEPARTURE');

    return {
      arrival: arrivalAddress ? this.mapAddress(arrivalAddress) : null,
      departure: departureAddress ? this.mapAddress(departureAddress) : null,
    };
  }

  static toQuoteForCustomerDto(quote: QuoteForCustomerDto) {
    const addresses = this.extractAddresses(quote.quoteRequest.quoteRequestAddresses);

    return {
      price: quote.price,
      mover: { ...quote.mover, user: undefined, moverName: quote.mover.user.name },
      request: {
        ...quote.quoteRequest,
        fromRegion: undefined,
        toRegion: undefined,
        quoteRequestAddresses: undefined,
        arrival: addresses.arrival,
        departure: addresses.departure,
        moveType: MOVE_TYPE[quote.quoteRequest.moveType],
      },
      customRequest: Boolean(quote.targetedQuoteRequestId),
      matched: Boolean(quote.quoteMatch),
    };
  }

  static toQuoteForMoverDto(quote: QuoteForMoverDto) {
    const addresses = this.extractAddresses(quote.quoteRequest.quoteRequestAddresses);

    return {
      price: quote.price,
      customerName: quote?.quoteRequest.customer.user.name,
      request: {
        ...quote.quoteRequest,
        fromRegion: undefined,
        toRegion: undefined,
        quoteRequestAddresses: undefined,
        customer: undefined,
        arrival: addresses.arrival,
        departure: addresses.departure,
        moveType: MOVE_TYPE[quote.quoteRequest.moveType],
      },
      customRequest: Boolean(quote.targetedQuoteRequestId),
      matched: Boolean(quote.quoteMatch),
      completed: quote.quoteRequest.moveDate <= new Date() && quote.quoteMatch,
    };
  }
}
