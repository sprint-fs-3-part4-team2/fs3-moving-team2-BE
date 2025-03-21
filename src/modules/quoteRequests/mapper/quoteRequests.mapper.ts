import { QuoteRequestAddress } from '@prisma/client';
import { QuoteForMoverListDto, QuoteForMoverListDtoRequest } from '../dto/quoteForMoverListDto';

export default class QuoteRequestsMapper {
  static toQuoteForMoverListDto(quote: QuoteForMoverListDto): QuoteForMoverListDtoRequest {
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
      movingType: [quote.moveType.toLowerCase().split('_')[0]] as ['small'] | ['home'] | ['office'],
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
