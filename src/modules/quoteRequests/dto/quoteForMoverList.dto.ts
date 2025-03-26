import {
  QuoteRequest,
  QuoteRequestAddress,
  QuoteStatusHistory,
  TargetedQuoteRequest,
} from '@prisma/client';

export interface QuoteForMoverListDtoRequest {
  quoteId: string;
  movingType: ['small'] | ['home'] | ['office'];
  isCustomQuote: boolean;
  customerName: string;
  movingDate: Date;
  departure: string;
  arrival: string;
  variant: 'requested';
  requestedAt: Date;
  moverId?: string | null;
  quoteStatus?: string | null;
  targetedMoverId?: string | null;
}

export interface QuoteForMoverListDto extends QuoteRequest {
  targetedQuoteRequestId?: string | null;
  // customer가 없는 경우도 고려하여 옵셔널로 처리 (실제 데이터 구조에 맞게 수정)
  quoteRequestAddresses: QuoteRequestAddress[];
  quoteStatusHistories: QuoteStatusHistory[];
  targetedQuoteRequests?: TargetedQuoteRequest[];
  customer?: {
    user: {
      name: string;
    };
  };
  targetedMoverId?: string | null;
}
