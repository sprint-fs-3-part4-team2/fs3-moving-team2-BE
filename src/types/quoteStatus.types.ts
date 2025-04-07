export type QuoteStatus =
  | 'QUOTE_REQUESTED'
  | 'QUOTE_CONFIRMED'
  | 'QUOTE_CANCELED'
  | 'REQUEST_EXPIRED'
  | 'MOVE_COMPLETED';

// * 견적 상태 종류
// * QUOTE_REQUESTED: 견적 요청
// * QUOTE_CONFIRMED: 견적 확정
// * QUOTE_CANCELED: 견적 취소
// * REQUEST_EXPIRED: 요청 만료
// * MOVE_COMPLETED: 이사 완료
// *
