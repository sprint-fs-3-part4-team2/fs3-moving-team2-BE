import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MoverRepository {
  // 기사님 목록 조회
  async getMovers(sortBy: string) {
    const orderBy = this.getOrderBy(sortBy);

    return await prisma.mover.findMany({
      select: {
        id: true,
        profileImage: true,
        experienceYears: true,
        introduction: true,
        description: true,
        averageRating: true,
        totalReviews: true,
        totalCustomerFavorite: true,
        totalConfirmedCount: true,
        user: {
          select: {
            name: true,
          },
        },
        moverServices: {
          select: {
            serviceType: true,
          },
        },
        moverServiceRegions: {
          select: {
            region: true,
          },
        },
      },
      orderBy,
    });
  }

  // 기사님 검색
  async searchMovers(keyword: string) {
    return await prisma.mover.findMany({
      where: {
        OR: [
          { user: { name: { contains: keyword, mode: 'insensitive' } } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        profileImage: true,
        experienceYears: true,
        introduction: true,
        description: true,
        averageRating: true,
        totalReviews: true,
        totalCustomerFavorite: true,
        totalConfirmedCount: true,
        user: {
          select: {
            name: true,
          },
        },
        moverServices: {
          select: {
            serviceType: true,
          },
        },
        moverServiceRegions: {
          select: {
            region: true,
          },
        },
      },
      orderBy: {
        totalReviews: 'desc',
      },
    });
  }

  // 정렬 옵션 설정
  private getOrderBy(sortBy: string): Prisma.MoverOrderByWithRelationInput {
    switch (sortBy) {
      case 'reviews':
        return { totalReviews: 'desc' };
      case 'rating':
        return { averageRating: 'desc' };
      case 'confirmed':
        return { totalConfirmedCount: 'desc' };
      case 'experience':
        return { experienceYears: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }
}
