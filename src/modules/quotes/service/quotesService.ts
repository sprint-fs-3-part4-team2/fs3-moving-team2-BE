import { NotFoundException } from '@/core/errors';
import QuotesRepository from '../repository/quotesRepository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { MOVE_TYPE } from '@/constants/serviceType';
import { Region, ServiceType } from '@prisma/client';

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
}
