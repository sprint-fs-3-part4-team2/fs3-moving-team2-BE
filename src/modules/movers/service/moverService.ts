import { MoverRepository } from '../repository/moverRepository';

const moverRepository = new MoverRepository();

export class MoverService {
  // 기사님 목록 가져오기 (정렬 적용)
  async getMovers(sortBy: string) {
    return await moverRepository.getMovers(sortBy);
  }

  // 지역 목록 조회
  async getRegions(): Promise<string[]> {
    return moverRepository.getRegions();
  }
  // 서비스 목록 조회
  async getServices(): Promise<string[]> {
    return moverRepository.getServices();
  }

  // 검색 기능 추가
  async searchMovers(keyword: string) {
    return await moverRepository.searchMovers(keyword);
  }
}
