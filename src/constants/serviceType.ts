import { Region } from '@prisma/client';

export const MOVE_TYPE = {
  HOME_MOVE: 'home',
  SMALL_MOVE: 'small',
  OFFICE_MOVE: 'office',
} as const;

export const MOVE_TYPE_KOREAN = {
  HOME_MOVE: '가정이사',
  SMALL_MOVE: '소형이사',
  OFFICE_MOVE: '사무실이사',
} as const;

export const MOVE_TYPE_ENGLISH: Record<
  (typeof MOVE_TYPE_KOREAN)[keyof typeof MOVE_TYPE_KOREAN],
  keyof typeof MOVE_TYPE_KOREAN
> = {
  가정이사: 'HOME_MOVE',
  소형이사: 'SMALL_MOVE',
  사무실이사: 'OFFICE_MOVE',
} as const;

// HOME_MOVE -> 가정이사
export function getKoreanMoveType(moveType: keyof typeof MOVE_TYPE_KOREAN): string {
  return MOVE_TYPE_KOREAN[moveType] || '알 수 없음';
}

// 가정이사 -> HOME_MOVE
export function getEnglishMoveType(
  koreanType: keyof typeof MOVE_TYPE_ENGLISH,
): keyof typeof MOVE_TYPE_KOREAN {
  return MOVE_TYPE_ENGLISH[koreanType] || '알 수 없음';
}

// 서울, SEOUL
export const REGION_MAP: Record<string, keyof typeof Region> = {
  서울: 'SEOUL',
  서울특별시: 'SEOUL',
  부산: 'BUSAN',
  부산광역시: 'BUSAN',
  대구: 'DAEGU',
  대구광역시: 'DAEGU',
  인천: 'INCHEON',
  인천광역시: 'INCHEON',
  광주: 'GWANGJU',
  광주광역시: 'GWANGJU',
  대전: 'DAEJEON',
  대전광역시: 'DAEJEON',
  울산: 'ULSAN',
  울산광역시: 'ULSAN',
  세종: 'SEJONG',
  세종특별자치시: 'SEJONG',
  경기: 'GYEONGGI',
  경기도: 'GYEONGGI',
  강원: 'GANGWON',
  강원도: 'GANGWON',
  강원특별자치도: 'GANGWON',
  충청북도: 'CHUNGBUK',
  충청남도: 'CHUNGNAM',
  전라북도: 'JEONBUK',
  전라남도: 'JEONNAM',
  경상북도: 'GYEONGBUK',
  경상남도: 'GYEONGNAM',
  제주: 'JEJU',
  제주특별자치도: 'JEJU',
};
