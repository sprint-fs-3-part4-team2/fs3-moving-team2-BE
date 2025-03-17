import { ForbiddenException, NotFoundException } from '@/core/errors';
import QuotesRepository from '../repository/quotesRepository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { AUTH_MESSAGES } from '@/constants/authMessages';

export default class QuotesService {
  constructor(private quotesRepository: QuotesRepository) {}

  async getQuoteByIdForCustomer(quoteId: string) {
    const quote = await this.quotesRepository.getQuoteForCustomer(quoteId);
    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    // if (quote?.quote_request.customer_id !== customerId)
    //   throw new ForbiddenException(AUTH_MESSAGES.forbidden);

    return {
      mover: quote.mover,
      request: quote.quote_request,
      customRequest: quote.targeted_quote_request_id ? true : false,
      matched: quote.quote_match ? true : false,
    };
  }
}
