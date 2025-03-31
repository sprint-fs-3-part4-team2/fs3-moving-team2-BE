import { MOVE_TYPE } from '@/constants/serviceType';
import { MoverRepository } from '../repository/moverRepository';
import { PrismaClient } from '@prisma/client';

const moverRepository = new MoverRepository();
const prisma = new PrismaClient();

export class MoverService {
  // 기사님 목록 가져오기 (정렬 적용)
  async getMovers(sortBy: string, userId?: string) {
    const movers = await moverRepository.getMovers(sortBy);

    // 로그인한 사용자의 좋아요 목록과 견적 확정 목록 가져오기
    let userFavorites: string[] = [];
    let userConfirmedQuotes: string[] = [];

    if (userId) {
      // User ID로 Customer 정보 조회
      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (customer) {
        const [favorites, confirmedQuotes] = await Promise.all([
          prisma.customerFavorite.findMany({
            where: { customerId: customer.id },
            select: { moverId: true },
          }),
          prisma.moverQuote.findMany({
            where: {
              quoteRequest: {
                customerId: customer.id,
              },
              quoteMatch: {
                isCompleted: true,
              },
            },
            select: { moverId: true },
          }),
        ]);

        userFavorites = favorites.map((f) => f.moverId);
        userConfirmedQuotes = confirmedQuotes.map((q) => q.moverId);
      }
    }

    return movers.map((mover) => ({
      id: mover.id,
      moverName: mover.user.name,
      imageUrl: mover.profileImage || '/profile-placeholder.png',
      movingType: mover.moverServices.map((service) => MOVE_TYPE[service.serviceType]),
      isCustomQuote: userConfirmedQuotes.includes(mover.id),
      rating: mover.averageRating ?? 0,
      ratingCount: mover.totalReviews,
      experienceYears: mover.experienceYears,
      quoteCount: mover.totalConfirmedCount,
      isFavorite: userFavorites.includes(mover.id),
      favoriteCount: mover.totalCustomerFavorite ?? 0,
      isFavoriteMoverList: false,
      description: mover.description || mover.introduction,
    }));
  }

  // 기사님 검색
  async searchMovers(keyword: string, userId?: string) {
    const movers = await moverRepository.searchMovers(keyword);

    // 로그인한 사용자의 좋아요 목록과 견적 확정 목록 가져오기
    let userFavorites: string[] = [];
    let userConfirmedQuotes: string[] = [];

    if (userId) {
      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (customer) {
        const [favorites, confirmedQuotes] = await Promise.all([
          prisma.customerFavorite.findMany({
            where: { customerId: customer.id },
            select: { moverId: true },
          }),
          prisma.moverQuote.findMany({
            where: {
              quoteRequest: {
                customerId: customer.id,
              },
              quoteMatch: {
                isCompleted: true,
              },
            },
            select: { moverId: true },
          }),
        ]);

        userFavorites = favorites.map((f) => f.moverId);
        userConfirmedQuotes = confirmedQuotes.map((q) => q.moverId);
      }
    }

    return movers.map((mover) => ({
      id: mover.id,
      moverName: mover.user.name,
      imageUrl: mover.profileImage || '/profile-placeholder.png',
      movingType: mover.moverServices.map((service) => MOVE_TYPE[service.serviceType]),
      isCustomQuote: userConfirmedQuotes.includes(mover.id),
      rating: mover.averageRating ?? 0,
      ratingCount: mover.totalReviews,
      experienceYears: mover.experienceYears,
      quoteCount: mover.totalConfirmedCount,
      isFavorite: userFavorites.includes(mover.id),
      favoriteCount: mover.totalCustomerFavorite ?? 0,
      isFavoriteMoverList: false,
      description: mover.description || mover.introduction,
    }));
  }
}
