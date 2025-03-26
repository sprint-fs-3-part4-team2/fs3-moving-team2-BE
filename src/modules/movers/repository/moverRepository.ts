import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MoverRepository {
  // 기사님 목록 조회
  async getMovers(sortBy: string) {
    const orderBy = this.getOrderBy(sortBy);

    return await prisma.mover.findMany({
      include: {
        moverServices: true,
        moverServiceRegions: true,
      },
      orderBy,
    });
  }

  // 지역 목록 조회
  async getRegions(): Promise<string[]> {
    return prisma.moverServiceRegion
      .findMany({ select: { region: true } })
      .then((regions) => regions.map((r) => r.region));
  }

  async getServices(): Promise<string[]> {
    return prisma.moverService
      .findMany({ select: { serviceType: true } })
      .then((services) => services.map((s) => s.serviceType));
  }

  // 정렬 옵션 설정
  private getOrderBy(sortBy: string): Prisma.MoverOrderByWithRelationInput {
    switch (sortBy) {
      case 'reviews':
        return { totalReviews: 'desc' };
      case 'rating':
        return { averageRating: 'desc' };
      case 'experience':
        return { experienceYears: 'desc' };
      case 'confirmed':
        return { totalConfirmedCount: 'desc' };
      default:
        return {};
    }
  }

  // 검색 기능 (이름, 소개에서 검색)
  async searchMovers(keyword: string) {
    return await prisma.mover.findMany({
      where: {
        OR: [
          { introduction: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      },
    });
  }
}
