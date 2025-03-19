import { Region } from '@prisma/client';
export interface CustomerFind {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  profileImage: string;
  location: Region;
}

export interface MoverFind {
  id: string;
  userId: string;
  profileImage: string;
  experienceYears: number;
  introduction: string;
  description: string;
  averageRating: number;
  totalReviews: number;
  totalCustomerFavorite: number;
  totalConfirmedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ToFromType = {
  resion: string;
  sido: string;
  sigungu: string;
  street: string;
};

export type qshStatus =
  | 'QUOTE_REQUESTED' //견적 요청
  | 'MOVER_SUBMITTED' //이사업자가 견적 제출
  | 'QUOTE_CONFIRMED' //견적 확정
  | 'QUOTE_CANCELED' //견적 취소
  | 'REQUEST_EXPIRED' //요청 만료
  | 'MOVE_COMPLETED'; //이사 완료
