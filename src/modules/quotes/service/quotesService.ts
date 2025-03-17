import { ForbiddenException, NotFoundException } from '@/core/errors';
import QuotesRepository from '../repository/quotesRepository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { AUTH_MESSAGES } from '@/constants/authMessages';
import { MOVE_TYPE } from '@/constants/serviceType';

export default class QuotesService {
  constructor(private quotesRepository: QuotesRepository) {}

  async getQuoteByIdForCustomer(quoteId: string) {
    const quote = await this.quotesRepository.getQuoteForCustomer(quoteId);
    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    // if (quote?.quote_request.customer_id !== customerId)
    //   throw new ForbiddenException(AUTH_MESSAGES.forbidden);

    const arrivalAddress = quote.quoteRequest.quoteRequestAddresses.find(
      (address) => address.type === 'ARRIVAL',
    )?.fullAddress;
    const departureAddress = quote.quoteRequest.quoteRequestAddresses.find(
      (address) => address.type === 'DEPARTURE',
    )?.fullAddress;

    const moveType = MOVE_TYPE[quote.quoteRequest.moveType];

    return {
      price: quote.price,
      mover: { ...quote.mover, user: undefined, moverName: quote.mover.user.name },
      request: {
        ...quote.quoteRequest,
        fromRegion: undefined,
        toRegion: undefined,
        quoteRequestAddresses: undefined,
        arrival: arrivalAddress,
        departure: departureAddress,
        moveType,
      },
      customRequest: quote.targetedQuoteRequestId ? true : false,
      matched: quote.quoteMatch ? true : false,
    };
  }
}
