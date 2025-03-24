import QuoteRequestsRepository from '../repository/quoteRequests.repository';
import QuoteMapper from '@/modules/moverQuotes/mapper/moverQuote.mapper';
import { getEnglishMoveType, MOVE_TYPE_KOREAN, REGION_MAP } from '@/constants/serviceType';
import { createQuoteRequestDto } from '../dto/createQuoteRequest.dto';

export default class QuoteRequestsService {
  constructor(private quoteRequestRepository: QuoteRequestsRepository) {}

  async createQuoteRequest(customerId: string, data: createQuoteRequestDto) {
    const quoteRequest = await this.quoteRequestRepository.createQuoteRequest({
      customerId,
      moveType: getEnglishMoveType(data.moveType),
      moveDate: new Date(data.moveDate),
      fromRegion: REGION_MAP[data.departure.sido],
      toRegion: REGION_MAP[data.arrival.sido],
      quoteRequestAddresses: {
        create: [
          {
            type: 'DEPARTURE',
            sido: data.departure.sido,
            sigungu: data.departure.sigungu,
            street: data.departure.street,
            fullAddress: data.departure.fullAddress,
          },
          {
            type: 'ARRIVAL',
            sido: data.arrival.sido,
            sigungu: data.arrival.sigungu,
            street: data.arrival.street,
            fullAddress: data.arrival.fullAddress,
          },
        ],
      },
    });

    return { data: quoteRequest, message: '견적 요청이 성공적으로 생성되었습니다.' };
  }

  async getLatestQuoteRequestForCustomer(customerId: string) {
    // 최근 고객의 견적 요청을 조회
    const quote = await this.quoteRequestRepository.getLatestQuoteRequestForCustomer(customerId);

    if (!quote) {
      return { isRequested: false };
    }

    // active 상태일 때 필요한 정보 매핑
    return {
      isRequested: true,
      quote: {
        id: quote.id,
        movingDate: quote.moveDate,
        // 내부에 저장된 enum값(예: "HOME_MOVE")을 한글로 변환
        movingType: MOVE_TYPE_KOREAN[quote.moveType],
        requestedDate: quote.createdAt,
        arrival: quote.quoteRequestAddresses.find((address) => address.type === 'ARRIVAL')
          ?.fullAddress,
        departure: quote.quoteRequestAddresses.find((address) => address.type === 'DEPARTURE')
          ?.fullAddress,
      },
    };
  }

  async getAllQuoteRequests(page: number, pageSize: number) {
    const data = await this.quoteRequestRepository.getAllQuoteRequests(page, pageSize);

    return {
      list: data.list.map((quote) => QuoteMapper.toQuoteForMoverListDto(quote)),
      totalCount: data.totalCount,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  }
}
