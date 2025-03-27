import { QuoteRequestAddress } from '@prisma/client';
import { QuoteForMoverListDto, QuoteForMoverListDtoRequest } from '../dto/quoteForMoverList.dto';

export default class QuoteRequestsMapper {
  static toQuoteForMoverListDto(
    quote: QuoteForMoverListDto,
    moverId: string,
  ): QuoteForMoverListDtoRequest {
    // 견적 주소에서 출발지(DEPATURE)와 도착지(ARRIVAL) 추출
    const departureAddress = quote.quoteRequestAddresses.find(
      (address: QuoteRequestAddress) => address.type === 'DEPARTURE',
    );
    const arrivalAddress = quote.quoteRequestAddresses.find(
      (address: QuoteRequestAddress) => address.type === 'ARRIVAL',
    );

    // 최신 견적 상태(history) 찾기
    let quoteStatus = null;
    if (quote.quoteStatusHistories && quote.quoteStatusHistories.length > 0) {
      const latestStatusHistory = [...quote.quoteStatusHistories].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];
      quoteStatus = latestStatusHistory.status;
    }

    // 지정 견적 요청이 존재하고, 현재 기사님(moverId)에게 지정된 요청이 있다면 추출
    let targetedMoverId = null;
    if (quote.targetedQuoteRequests && quote.targetedQuoteRequests.length > 0) {
      const targetedRequest = quote.targetedQuoteRequests.find((t: any) => t.moverId === moverId);
      if (targetedRequest) {
        targetedMoverId = targetedRequest.moverId;
      }
    }

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
      moverId,
      quoteStatus,
      targetedMoverId,
    };
  }
}
