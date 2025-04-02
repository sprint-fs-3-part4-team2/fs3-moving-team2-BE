import { MOVE_TYPE } from '@/constants/serviceType';
import { MoverRepository } from '../repository/moverRepository';
import { PrismaClient } from '@prisma/client';
import { regionMap } from '@/constants/serviceType';

const moverRepository = new MoverRepository();
const prisma = new PrismaClient();

// 영문 지역 코드를 한글로 변환하는 맵
export const reverseRegionMap: Record<string, string> = Object.entries(regionMap).reduce(
  (acc, [kor, eng]) => {
    acc[eng] = kor;
    return acc;
  },
  {} as Record<string, string>,
);

export class MoverService {
  // 기사님 목록 가져오기 (정렬 적용)
  async getMovers(sortBy: string, userId?: string, area?: string, service?: string) {
    const movers = await moverRepository.getMovers(sortBy, area, service);

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
      description: mover.description,
      regions: mover.moverServiceRegions.map((r) => reverseRegionMap[r.region]),
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
      regions: mover.moverServiceRegions.map((r) => reverseRegionMap[r.region]),
    }));
  }

  // 기사님 상세 정보 조회
  async getMoverById(moverId: string, userId?: string) {
    const mover = await moverRepository.getMoverById(moverId);

    if (!mover) {
      return null;
    }

    // 로그인한 사용자의 좋아요 여부와 견적 확정 여부 가져오기
    let isFavorite = false;
    let isCustomQuote = false;

    if (userId) {
      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (customer) {
        const [favorite, confirmedQuote] = await Promise.all([
          prisma.customerFavorite.findFirst({
            where: {
              customerId: customer.id,
              moverId: mover.id,
            },
          }),
          prisma.moverQuote.findFirst({
            where: {
              quoteRequest: {
                customerId: customer.id,
              },
              quoteMatch: {
                isCompleted: true,
              },
              moverId: mover.id,
            },
          }),
        ]);

        isFavorite = !!favorite;
        isCustomQuote = !!confirmedQuote;
      }
    }

    return {
      id: mover.id,
      moverName: mover.user.name,
      imageUrl: mover.profileImage || '/profile-placeholder.png',
      movingType: mover.moverServices.map((service) => MOVE_TYPE[service.serviceType]),
      isCustomQuote,
      rating: mover.averageRating ?? 0,
      ratingCount: mover.totalReviews,
      experienceYears: mover.experienceYears,
      quoteCount: mover.totalConfirmedCount,
      isFavorite,
      favoriteCount: mover.totalCustomerFavorite ?? 0,
      introduction: mover.introduction,
      description: mover.description,
      regions: mover.moverServiceRegions.map((r) => reverseRegionMap[r.region]),
    };
  }

  // 기사님 리뷰 목록 조회
  async getMoverReviews(moverId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [reviews, totalCount, aggregateResult] = await Promise.all([
      prisma.review.findMany({
        where: {
          quoteMatch: {
            moverQuote: {
              moverId,
            },
          },
        },
        select: {
          id: true,
          rating: true,
          content: true,
          createdAt: true,
          quoteMatch: {
            select: {
              moverQuote: {
                select: {
                  quoteRequest: {
                    select: {
                      customer: {
                        select: {
                          user: {
                            select: {
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          quoteMatch: {
            moverQuote: {
              moverId,
            },
          },
        },
      }),
      prisma.review.aggregate({
        where: {
          quoteMatch: {
            moverQuote: {
              moverId,
            },
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      }),
    ]);

    // 별점 분포 계산 (1~5점)
    const ratingCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const review of reviews) {
      const rating = review.rating;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating] += 1;
      }
    }

    const averageRating = Number((aggregateResult._avg.rating ?? 0).toFixed(1));
    const ratingCount = aggregateResult._count.rating ?? 0;

    return {
      reviews: reviews.map((review) => ({
        id: review.id,
        name: review.quoteMatch.moverQuote.quoteRequest.customer.user.name.replace(
          /(?<=.{2})./g,
          '*',
        ),
        writtenAt: review.createdAt.toISOString().split('T')[0],
        rating: review.rating,
        content: review.content,
      })),
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      averageRating,
      ratingCount,
      ratingCounts,
    };
  }
}
