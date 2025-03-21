import { NotFoundException } from '@/core/errors';
import QuotesRepository from '../repository/quotesRepository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { Region, ServiceType } from '@prisma/client';
import QuoteMapper from '../mapper/quote.mapper';

export default class QuotesService {
  constructor(private quotesRepository: QuotesRepository) {}

  async getQuoteByIdForCustomer(quoteId: string) {
    const quote = await this.quotesRepository.getQuoteForCustomer(quoteId);
    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    // 유저 기능 구현 후 추가 예정
    // if (quote?.quote_request.customer_id !== customerId)
    //   throw new ForbiddenException(AUTH_MESSAGES.forbidden);

    return QuoteMapper.toQuoteForCustomerDto(quote);
  }

  async getQuoteByIdForMover(quoteId: string) {
    const quote = await this.quotesRepository.getQuoteForMover(quoteId);
    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    // 유저 기능 구현 후 추가 예정
    // if (quote?.quote_request.customer_id !== customerId)
    //   throw new ForbiddenException(AUTH_MESSAGES.forbidden);

    return QuoteMapper.toQuoteForMoverDto(quote);
  }

  async getQuotesListByMover(page: number, pageSize: number, moverId: string) {
    const data = await this.quotesRepository.getQuotesListByMover(page, pageSize, moverId);

    const mappedList = data.list.map((quote) => QuoteMapper.toQuoteForMoverDto(quote));
    return {
      ...data,
      list: mappedList,
    };
  }

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
    await this.quotesRepository.createQuoteRequest({
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
    const quote = await this.quotesRepository.getLatestQuoteRequestByCustomer(customerId);

    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    const latestStatus = quote.quoteStatusHistories[0];

    // 견적 요청 상태가 견적 요청, 견적 제출, 견적 확정 중 하나이면 true를 반환
    const activeStatuses = ['QUOTE_REQUESTED', 'MOVER_SUBMITTED', 'QUOTE_CONFIRMED'];
    const isRequested = activeStatuses.includes(latestStatus.status);

    return {
      isRequested,
      quote: {
        createdAt: quote.createdAt,
        moveType: quote.moveType,
        moveDate: quote.moveDate,
        moveFrom: quote.quoteRequestAddresses.find((address) => address.type === 'DEPARTURE')
          ?.fullAddress,
        moveTo: quote.quoteRequestAddresses.find((address) => address.type === 'ARRIVAL')
          ?.fullAddress,
      },
    };
  }

  async getAllQuoteRequests(page: number, pageSize: number) {
    const data = await this.quotesRepository.getAllQuoteRequests(page, pageSize);

    return {
      list: data.list.map((quote) => QuoteMapper.toQuoteForMoverListDto(quote)),
      totalCount: data.totalCount,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  }
}
