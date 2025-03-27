export type QuoteStatus =
  | 'QUOTE_REQUESTED'
  | 'MOVER_SUBMITTED'
  | 'QUOTE_CONFIRMED'
  | 'QUOTE_CANCELED'
  | 'REQUEST_EXPIRED'
  | 'MOVE_COMPLETED'
  | 'TARGETED_QUOTE_REJECTED';

// * 견적 상태 종류
// * QUOTE_REQUESTED: 견적 요청
// * MOVER_SUBMITTED: 이사업자가 견적 제출
// * QUOTE_CONFIRMED: 견적 확정
// * QUOTE_CANCELED: 견적 취소
// * REQUEST_EXPIRED: 요청 만료
// * MOVE_COMPLETED: 이사 완료
// * TARGETED_QUOTE_REJECTED: 지정견적 거절
// *
