import { ForbiddenException, NotFoundException } from '@/core/errors';
import QuotesRepository from '../repository/quotesRepository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { AUTH_MESSAGES } from '@/constants/authMessages';
import { MOVE_TYPE } from '@/constants/serviceType';
import { AddressType } from '@prisma/client';

export default class QuotesService {
  constructor(private quotesRepository: QuotesRepository) {}

  private extractAddress(
    quoteAddresses: {
      id: string;
      quoteRequestId: string;
      sido: string;
      sigungu: string;
      street: string;
      fullAddress: string;
      type: AddressType;
    }[],
  ) {
    const ADDRESS_TYPES = ['ARRIVAL', 'DEPARTURE'];
    return ADDRESS_TYPES.map((type) => quoteAddresses.find((address) => address.type === type));
  }

  async getQuoteByIdForCustomer(quoteId: string) {
    const quote = await this.quotesRepository.getQuoteForCustomer(quoteId);
    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    // 유저 기능 구현 후 추가 예정
    // if (quote?.quote_request.customer_id !== customerId)
    //   throw new ForbiddenException(AUTH_MESSAGES.forbidden);
    const { quoteRequestAddresses } = quote.quoteRequest;
    const [arrivalAddress, departureAddress] = this.extractAddress(quoteRequestAddresses);
    const moveType = MOVE_TYPE[quote.quoteRequest.moveType];

    return {
      price: quote.price,
      mover: { ...quote.mover, user: undefined, moverName: quote.mover.user.name },
      request: {
        ...quote.quoteRequest,
        fromRegion: undefined,
        toRegion: undefined,
        quoteRequestAddresses: undefined,
        arrival: { ...arrivalAddress, id: undefined, quoteRequestId: undefined, type: undefined },
        departure: {
          ...departureAddress,
          Id: undefined,
          quoteRequestId: undefined,
          type: undefined,
        },
        moveType,
      },
      customRequest: quote.targetedQuoteRequestId ? true : false,
      matched: quote.quoteMatch ? true : false,
    };
  }

  async getQuoteByIdForMover(quoteId: string) {
    const quote = await this.quotesRepository.getQuoteForMover(quoteId);
    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    // 유저 기능 구현 후 추가 예정
    // if (quote?.quote_request.customer_id !== customerId)
    //   throw new ForbiddenException(AUTH_MESSAGES.forbidden);
    const { quoteRequestAddresses } = quote.quoteRequest;
    const [arrivalAddress, departureAddress] = this.extractAddress(quoteRequestAddresses);
    const moveType = MOVE_TYPE[quote.quoteRequest.moveType];

    return {
      price: quote.price,
      customerName: quote?.quoteRequest.customer.user.name,
      request: {
        ...quote.quoteRequest,
        fromRegion: undefined,
        toRegion: undefined,
        quoteRequestAddresses: undefined,
        customer: undefined,
        arrival: { ...arrivalAddress, id: undefined, quoteRequestId: undefined, type: undefined },
        departure: {
          ...departureAddress,
          id: undefined,
          quoteRequestId: undefined,
          type: undefined,
        },
        moveType,
      },
      customRequest: quote.targetedQuoteRequestId ? true : false,
      matched: quote.quoteMatch ? true : false,
    };
  }
}
