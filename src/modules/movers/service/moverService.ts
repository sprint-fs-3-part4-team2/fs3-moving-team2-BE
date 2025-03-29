import { MOVE_TYPE } from '@/constants/serviceType';
import { MoverRepository } from '../repository/moverRepository';

const moverRepository = new MoverRepository();

export class MoverService {
  // 기사님 목록 가져오기 (정렬 적용)
  async getMovers(sortBy: string) {
    const movers = await moverRepository.getMovers(sortBy);

    return movers.map((mover) => ({
      id: mover.id,
      moverName: mover.user.name,
      imageUrl: mover.profileImage || '/profile-placeholder.png',
      movingType: mover.moverServices.map((service) => MOVE_TYPE[service.serviceType]),
      isCustomQuote: false,
      rating: mover.averageRating ?? 0,
      ratingCount: mover.totalReviews,
      experienceYears: mover.experienceYears,
      quoteCount: mover.totalConfirmedCount,
      isFavorite: false,
      favoriteCount: mover.totalCustomerFavorite ?? 0,
      isFavoriteMoverList: false,
      description: mover.description || mover.introduction,
    }));
  }

  // 검색 기능 추가
  async searchMovers(keyword: string) {
    const movers = await moverRepository.searchMovers(keyword);

    return movers.map((mover) => ({
      id: mover.id,
      moverName: mover.user.name,
      imageUrl: mover.profileImage || '/profile-placeholder.png',
      movingType: mover.moverServices.map((service) => MOVE_TYPE[service.serviceType]),
      isCustomQuote: false,
      rating: mover.averageRating ?? 0,
      ratingCount: mover.totalReviews,
      experienceYears: mover.experienceYears,
      quoteCount: mover.totalConfirmedCount,
      isFavorite: false,
      favoriteCount: mover.totalCustomerFavorite ?? 0,
      isFavoriteMoverList: false,
      description: mover.description || mover.introduction,
    }));
  }
}
