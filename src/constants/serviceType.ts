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
  부산: 'BUSAN',
  대구: 'DAEGU',
  인천: 'INCHEON',
  광주: 'GWANGJU',
  대전: 'DAEJEON',
  울산: 'ULSAN',
  세종: 'SEJONG',
  경기: 'GYEONGGI',
  강원: 'GANGWON',
  충북: 'CHUNGBUK',
  충남: 'CHUNGNAM',
  전북: 'JEONBUK',
  전남: 'JEONNAM',
  경북: 'GYEONGBUK',
  경남: 'GYEONGNAM',
  제주: 'JEJU',
};
