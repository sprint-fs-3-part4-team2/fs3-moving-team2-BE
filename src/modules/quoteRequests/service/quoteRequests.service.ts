import QuoteRequestsRepository from '../repository/quoteRequests.repository';
import { getEnglishMoveType, MOVE_TYPE_KOREAN, REGION_MAP } from '@/constants/serviceType';
import { createQuoteRequestDto } from '../dto/createQuoteRequest.dto';
import QuoteRequestsMapper from '../mapper/quoteRequests.mapper';
import MoverQuotesRepository from '@/modules/moverQuotes/repository/moverQuotesRepository';

export default class QuoteRequestsService {
  constructor(
    private quoteRequestRepository: QuoteRequestsRepository,
    private moverQuotesRepository: MoverQuotesRepository,
  ) {}

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

    console.log('quoteRequestData', quoteRequest);

    return { message: '견적 요청이 성공적으로 생성되었습니다.' };
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

  async getAllQuoteRequests(
    page: number,
    pageSize: number,
    searchQuery: string,
    moveTypeQuery: string,
    isServiceRegionMatchQuery: boolean,
    isTargetedQuoteQuery: boolean,
    sortByQuery: string,
    moverId: string,
  ) {
    const whereClause: any = {};

    // 검색어로 고객 이름을 검색
    if (searchQuery) {
      whereClause.customer = {
        user: {
          name: {
            contains: searchQuery, // 검색어가 포함되는지 확인
            mode: 'insensitive', // 대소문자 구분 없이 검색
          },
        },
      };
    }

    // moveType 필터 추가 (클라이언트가 한글로 전달한 경우 한글→영문 enum으로 변환)
    // 여러 이사 유형이 콤마로 구분되어 전달될 수 있음
    if (moveTypeQuery) {
      // 콤마 단위로 split 후 앞뒤 공백 trim
      const moveTypeValues = moveTypeQuery
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const moveTypeEnums: Array<keyof typeof MOVE_TYPE_KOREAN> = [];
      for (const typeValue of moveTypeValues) {
        Object.entries(MOVE_TYPE_KOREAN).some(([key, koreanValue]) => {
          if (koreanValue === typeValue) {
            moveTypeEnums.push(key as keyof typeof MOVE_TYPE_KOREAN);
            return true;
          }
          return false;
        });
      }
      if (moveTypeEnums.length > 0) {
        whereClause.moveType = { in: moveTypeEnums };
      }
    }

    // 기본 정렬: 이사빠른순 (moveDate 오름차순) / sortByQuery가 요청일빠른순인 경우만 조건 변경
    let orderBy;
    if (sortByQuery === '요청일빠른순') {
      orderBy = { createdAt: 'asc' };
    } else {
      // sortByQuery가 없거나 '이사빠른순'인 경우 기본적으로 moveDate asc 정렬
      orderBy = { moveDate: 'asc' };
    }

    // isServiceRegionMatchQuery가 true이면,
    // 로그인한 기사님의 moverId를 기반으로 서비스 가능 지역을 조회하여 필터 적용
    if (isServiceRegionMatchQuery) {
      // 실제 사용 시에는 moverService나 moverRepository를 통해 기사님의 서비스 가능 지역을 조회
      const moverRegionsObjects =
        await this.moverQuotesRepository.getServiceRegionsForMover(moverId);
      const moverRegions: Array<keyof typeof REGION_MAP> = moverRegionsObjects.map((m) => m.region);
      whereClause.AND = [{ fromRegion: { in: moverRegions } }, { toRegion: { in: moverRegions } }];
    }

    // isTargetedQuoteQuery가 true이면,
    if (isTargetedQuoteQuery) {
      whereClause.targetedQuoteRequests = {
        some: { moverId: { equals: moverId } },
      };
    }

    const data = await this.quoteRequestRepository.getAllQuoteRequests(
      page,
      pageSize,
      whereClause,
      orderBy,
    );

    return {
      totalCount: data.totalCount,
      list: data.list.map((quote) => QuoteRequestsMapper.toQuoteForMoverListDto(quote, moverId)),
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  }
}
