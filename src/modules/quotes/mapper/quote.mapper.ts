import { QuoteRequestAddress } from '@prisma/client';
import { QuoteForCustomerDto } from '../dto/quoteForCustomer.dto';
import { MOVE_TYPE } from '@/constants/serviceType';
import { QuoteForMoverDto } from '../dto/quoteForMover.dto';
import { CustomerRequest } from '../dto/QuoteForMoverListDto';

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
      isCustomRequest: Boolean(quote.targetedQuoteRequestId),
      matched: Boolean(quote.quoteMatch),
    };
  }

  static toQuoteForMoverDto(quote: QuoteForMoverDto) {
    const addresses = this.extractAddresses(quote.quoteRequest.quoteRequestAddresses);

    return {
      id: quote.id,
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

  static toQuoteForMoverListDto(quote: any): CustomerRequest {
    console.log(quote);
    // 견적 주소에서 출발지(DEPATURE)와 도착지(ARRIVAL) 추출
    const departureAddress = quote.quoteRequestAddresses.find(
      (address: QuoteRequestAddress) => address.type === 'DEPARTURE',
    );
    const arrivalAddress = quote.quoteRequestAddresses.find(
      (address: QuoteRequestAddress) => address.type === 'ARRIVAL',
    );

    return {
      quoteId: quote.id, // quote 엔티티의 id 사용
      // movingType: [quote.moveType.toLowerCase()] as ['small'] | ['home'] | ['office'],
      movingType: [quote.moveType.toLowerCase()],
      isCustomQuote: Boolean(quote.targetedQuoteRequestId),
      customerName: quote.customer?.user?.name || '',
      movingDate: quote.moveDate,
      departure: departureAddress ? `${departureAddress.sido} ${departureAddress.sigungu}` : '',
      arrival: arrivalAddress ? `${arrivalAddress.sido} ${arrivalAddress.sigungu}` : '',
      variant: 'requested',
      requestedAt: quote.createdAt,
    };
  }
}
