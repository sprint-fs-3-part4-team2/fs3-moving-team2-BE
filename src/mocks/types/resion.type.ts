const area = [
  {
    name: '서울',
    en: 'SEOUL',
  },
  {
    name: '경기',
    en: 'GYEONGGI',
  },
  {
    name: '인천',
    en: 'INCHEON',
  },
  {
    name: '강원',
    en: 'GANGWON',
  },
  {
    name: '충북',
    en: 'CHUNGBUK',
  },
  {
    name: '충남',
    en: 'CHUNGNAM',
  },
  {
    name: '세종',
    en: 'SEJONG',
  },
  {
    name: '대전',
    en: 'DAEJEON',
  },
  {
    name: '전북',
    en: 'JEONBUK',
  },
  {
    name: '전남',
    en: 'JEONNAM',
  },
  {
    name: '광주',
    en: 'GWANGJU',
  },
  {
    name: '경북',
    en: 'GYEONGBUK',
  },
  {
    name: '경남',
    en: 'GYEONGNAM',
  },
  {
    name: '대구',
    en: 'DAEGU',
  },
  {
    name: '울산',
    en: 'ULSAN',
  },
  {
    name: '부산',
    en: 'BUSAN',
  },
  {
    name: '제주',
    en: 'JEJU',
  },
] as const;

export const enArea = area.map((item) => item.en);
export type Resion = (typeof enArea)[number];
export default area;
