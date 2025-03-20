import { MoverQuote, QuoteRequestAddress } from '@prisma/client';
import { QuoteMatchDto, QuoteRequestDto, UserWithName } from './quoteCommon.dto';

export interface QuoteForMoverDto extends MoverQuote {
  quoteRequest: QuoteRequestDto & {
    customer: UserWithName;
    quoteRequestAddresses: QuoteRequestAddress[];
  };
  quoteMatch: QuoteMatchDto;
}
