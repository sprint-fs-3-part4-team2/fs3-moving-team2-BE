import { QuoteMatch, QuoteRequest, QuoteRequestAddress, User } from '@prisma/client';

export interface UserWithName {
  user: Pick<User, 'name'>;
}

export type QuoteRequestDto = Pick<
  QuoteRequest,
  'customerId' | 'moveType' | 'moveDate' | 'createdAt'
> & {
  quoteRequestAddresses: QuoteRequestAddress[];
};

export type QuoteMatchDto = Pick<QuoteMatch, 'id'> | null;
