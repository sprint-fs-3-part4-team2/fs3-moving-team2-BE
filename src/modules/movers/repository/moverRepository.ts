import { Prisma, PrismaClient, Region, ServiceType } from '@prisma/client';
import { regionMap, MOVE_TYPE_ENGLISH } from '@/constants/serviceType';

const prisma = new PrismaClient();

export class MoverRepository {
  // 기사님 목록 조회
  async getMovers(sortBy: string, area?: string, service?: string) {
    const orderBy = this.getOrderBy(sortBy);

    const where: Prisma.MoverWhereInput = {};

    if (area && area !== '지역') {
      // 한글 지역명을 영문 코드로 변환
      const regionCode = regionMap[area] as Region;
      if (regionCode) {
        where.moverServiceRegions = {
          some: {
            region: regionCode,
          },
        };
      }
    }

    if (service && service !== '서비스') {
      // 한글 서비스명을 영문 코드로 변환
      const serviceCode = MOVE_TYPE_ENGLISH[
        service as keyof typeof MOVE_TYPE_ENGLISH
      ] as ServiceType;
      if (serviceCode) {
        where.moverServices = {
          some: {
            serviceType: serviceCode,
          },
        };
      }
    }

    return await prisma.mover.findMany({
      where,
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
