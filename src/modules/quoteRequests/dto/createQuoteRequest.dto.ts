import { MOVE_TYPE_KOREAN } from '@/constants/serviceType';
import { Region, ServiceType } from '@prisma/client';

export interface Address {
  sido: string;
  sigungu: string;
  street: string;
  fullAddress: string;
}

export interface createQuoteRequestDto {
  moveType: (typeof MOVE_TYPE_KOREAN)[keyof typeof MOVE_TYPE_KOREAN];
  moveDate: Date;
  departure: Address;
  arrival: Address;
}

// 견적 요청 생성 시 필요한 데이터(레파지토리로 전달)
export interface CreateQuoteRequestData {
  customerId: string;
  moveType: ServiceType;
  moveDate: Date;
  fromRegion: Region;
  toRegion: Region;
  quoteRequestAddresses: {
    create: Array<{
      type: 'DEPARTURE' | 'ARRIVAL';
      sido: string;
      sigungu: string;
      street: string;
      fullAddress: string;
    }>;
  };
}
