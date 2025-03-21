import { Mover, MoverQuote } from '@prisma/client';
import { QuoteMatchDto, QuoteRequestDto, UserWithName } from './quoteCommon.dto';

type OmittedMover = Omit<Mover, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'description'>;

export interface QuoteForCustomerDto extends MoverQuote {
  mover: OmittedMover & UserWithName;
  quoteMatch: QuoteMatchDto;
  quoteRequest: QuoteRequestDto;
}
