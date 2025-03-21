import { NotFoundException } from '@/core/errors';
import QuoteRequestsRepository from '../repository/quoteRequests.repository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { Region, ServiceType } from '@prisma/client';
import { MOVE_TYPE_KOREAN } from '@/constants/serviceType';
import QuoteRequestsMapper from '../mapper/quoteRequests.mapper';

export default class QuoteRequestsService {
  constructor(private quoteRequestRepository: QuoteRequestsRepository) {}

  async createQuoteRequest(customerId: string, data: any) {
    const parseRegion = (address: string): Region => {
      const regionMap: Record<string, Region> = {
        서울: 'SEOUL',
        부산: 'BUSAN',
        대구: 'DAEGU',
        울산: 'ULSAN',
        인천: 'INCHEON',
        광주: 'GWANGJU',
        대전: 'DAEJEON',
        세종: 'SEJONG',
        경기: 'GYEONGGI',
        강원: 'GANGWON',
        충북: 'CHUNGBUK',
        충남: 'CHUNGNAM',
        경북: 'GYEONGBUK',
        경남: 'GYEONGNAM',
        전북: 'JEONBUK',
        전남: 'JEONNAM',
        제주: 'JEJU',
      };
      const firstWord = address.split(' ')[0];
      return regionMap[firstWord] || 'SEOUL'; // 기본값 처리
    };

    const fromRegion = parseRegion(data.moveFrom);
    const toRegion = parseRegion(data.moveTo);

    // 두 번째 단어 이후의 문자열을 추출합니다.
    const fromSecondWord = data.moveFrom.split(' ')[1];
    const toSecondWord = data.moveTo.split(' ')[1];

    // 세 번째 단어 이후의 문자열을 추출합니다.
    const fromRest = data.moveFrom.split(' ').slice(2).join(' ');
    const toRest = data.moveTo.split(' ').slice(2).join(' ');

    // 견적 요청과 함께 두 주소를 같이 생성하도록 Repository에 전달합니다.
    await this.quoteRequestRepository.createQuoteRequest({
      customerId,
      moveType: data.moveType as ServiceType, // enum 값을 맞게 변환
      fromRegion,
      toRegion,
      moveDate: new Date(data.moveDate),
      // 관계를 같이 생성하는 nested create 사용
      quoteRequestAddresses: {
        create: [
          {
            type: 'DEPARTURE',
            sido: fromRegion, // 간단히 지역 값 저장
            sigungu: fromSecondWord,
            street: fromRest,
            fullAddress: data.moveFrom,
          },
          {
            type: 'ARRIVAL',
            sido: toRegion,
            sigungu: toSecondWord,
            street: toRest,
            fullAddress: data.moveTo,
          },
        ],
      },
    });

    return { message: '견적 요청이 성공적으로 생성되었습니다.' };
  }

  async getLatestQuoteForCustomer(customerId: string) {
    const quote = await this.quoteRequestRepository.getLatestQuoteRequestByCustomer(customerId);

    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    const latestStatus = quote.quoteStatusHistories[0];

    // 견적 요청 상태가 견적 요청, 견적 제출, 견적 확정 중 하나이면 true를 반환

    // 견적 확정하면 새로운 견적 요청을 할 수 있도록 구현됨 -> 확장시 수정 필요
    const activeStatuses = ['QUOTE_REQUESTED', 'MOVER_SUBMITTED'];

    // 견적 요청 상태가 이사 완료이면 새로운 견적 요청을 할 수 있도록 구현됨 -> 확장시 수정 필요
    // const activeStatuses = ['QUOTE_REQUESTED', 'MOVER_SUBMITTED', 'QUOTE_CONFIRMED'];
    const isRequested = activeStatuses.includes(latestStatus.status);

    if (isRequested) {
      // active 상태일 때 필요한 정보 매핑
      return {
        isRequested: true,
        quote: {
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
    } else {
      // active 상태가 아니라면
      return { isRequested: false };
    }
  }

  async getAllQuoteRequests(
    page: number,
    pageSize: number,
    searchQuery: string,
    moveTypeQuery: string,
    isServiceRegionMatchQuery: boolean,
    isTargetedQuoteQuery: boolean,
    sortByQuery: string,
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

    const data = await this.quoteRequestRepository.getAllQuoteRequests(
      page,
      pageSize,
      whereClause,
      // sortBy = 'moveDate', moveDate를 기준으로 정렬 + requestDate를 기준으로 정렬
    );

    return {
      list: data.list.map((quote) => QuoteRequestsMapper.toQuoteForMoverListDto(quote)),
      totalCount: data.totalCount,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  }
}
