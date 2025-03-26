import { LowercaseUserType } from './userType.types';

interface PageBaseQuery {
  page: number;
  pageSize: number;
  keyword?: string;
}

// 유효 검증된 쿼리
type ValidatedQuery = PageBaseQuery;

declare global {
  namespace Express {
    interface Request {
      validatedQuery: ValidatedQuery;
      user?: {
        userId: string;
        roleId: string;
        type: LowercaseUserType;
      };
    }
  }
}

export {};
