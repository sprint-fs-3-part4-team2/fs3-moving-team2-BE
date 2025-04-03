import QuoteRequestsRepository from '../repository/quoteRequests.repository';
import { getEnglishMoveType, MOVE_TYPE_KOREAN, REGION_MAP } from '@/constants/serviceType';
import { createQuoteRequestDto } from '../dto/createQuoteRequest.dto';
import QuoteRequestsMapper from '../mapper/quoteRequests.mapper';
import MoverQuotesRepository from '@/modules/moverQuotes/repository/moverQuotesRepository';
import { ConflictException, ForbiddenException, NotFoundException } from '@/core/errors';
import { AUTH_MESSAGES } from '@/constants/authMessages';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';

export default class QuoteRequestsService {
  constructor(
    private quoteRequestRepository: QuoteRequestsRepository,
    private moverQuotesRepository: MoverQuotesRepository,
  ) {}

  async createQuoteRequest(customerId: string, data: createQuoteRequestDto) {
    // 견적 요청이 안되는 견적 상태 조건
    const notAllowedConditions = ['QUOTE_REQUESTED', 'QUOTE_CONFIRMED']; // 견적 요청, 견적 확정 상태

    // 1. 최근 견적 요청이 있는지 확인
    const latestQuote =
      await this.quoteRequestRepository.getLatestQuoteRequestForCustomer(customerId);

    // 2. 최근 견적 요청이 존재하고 active 상태라면 생성할 수 없으므로 예외 처리
    if (latestQuote && notAllowedConditions.includes(latestQuote.currentStatus)) {
      throw new ConflictException(EXCEPTION_MESSAGES.alreadyRequestedQuote);
    }

    // 3. 이사일이 지났는지 확인
    if (latestQuote && latestQuote.currentStatus === 'MOVE_COMPLETED') {
      const moveDate = new Date(latestQuote.moveDate); // 이사일
      const allowedCreationDate = new Date(moveDate); // 이사일을 기준으로 설정
      allowedCreationDate.setDate(moveDate.getDate() + 1);
      allowedCreationDate.setHours(0, 0, 0, 0); // 이사일 다음 날 자정으로 설정
      const now = new Date();
      if (now < allowedCreationDate) {
        // 아직 이사일 다음 날이 되지 않은 경우
        throw new ConflictException(EXCEPTION_MESSAGES.cannotCreateQuoteBeforeMoveNextDay);
      }
    }

    // 4. 조건이 만족되면 견적 요청을 생성
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
        moveDate: quote.moveDate,
        // 내부에 저장된 enum값(예: "HOME_MOVE")을 한글로 변환
        moveType: MOVE_TYPE_KOREAN[quote.moveType],
        requestedDate: quote.createdAt,
        arrival: quote.quoteRequestAddresses.find((address) => address.type === 'ARRIVAL'),
        departure: quote.quoteRequestAddresses.find((address) => address.type === 'DEPARTURE'),
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

    // 기존에 whereClause.AND가 없다면 빈 배열로 초기화
    whereClause.AND = whereClause.AND || [];

    // 1. moverQuotes에 현재 moverId로 제출한 견적이 없어야 함.
    // 2. targetedQuoteRequests에 해당 moverId 관련 거절(반려) 기록이 없어야 함.
    whereClause.AND.push(
      {
        moverQuotes: {
          none: { moverId },
        },
      },
      {
        targetedQuoteRequests: {
          none: {
            moverId,
            // 여기서 targetedQuoteRejection가 존재하면 지정 견적 거절(반려)이 된 것으로 간주
            targetedQuoteRejection: { isNot: null },
          },
        },
      },
    );

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

  async cancelQuoteRequestById(customerId: string, quoteRequestId: string) {
    const quoteRequest = await this.quoteRequestRepository.findQuoteRequestById(quoteRequestId);
    if (!quoteRequest) throw new NotFoundException(EXCEPTION_MESSAGES.quoteRequestNotFound);
    const requestStatus = quoteRequest.currentStatus;
    if (requestStatus !== 'QUOTE_REQUESTED' && requestStatus !== 'MOVER_SUBMITTED')
      throw new ConflictException(EXCEPTION_MESSAGES.cannotCancelQuoteRequest);
    if (quoteRequest?.customerId !== customerId)
      throw new ForbiddenException(AUTH_MESSAGES.forbidden);

    await this.quoteRequestRepository.deleteQuoteRequestById(quoteRequestId);
  }
}
