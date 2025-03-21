export interface CustomerRequest {
  quoteId: string;
  movingType: ['small'] | ['home'] | ['office'];
  isCustomQuote: boolean;
  customerName: string;
  movingDate: Date;
  departure: string;
  arrival: string;
  variant: 'requested';
  requestedAt: Date;
}
