import { LowercaseUserType } from './userType.types';

interface PageBaseQuery {
  page: number;
  pageSize: number;
  keyword?: string;
}

// 유효 검증된 쿼리
export type ValidatedQuery = PageBaseQuery;

declare global {
  namespace Express {
    interface Request {
      validatedQuery: ValidatedQuery;
      userInfo?: {
        userId: string;
        roleId: string;
        type: LowercaseUserType;
      };
    }
  }
}

export {};
