import { PrismaClient } from '@prisma/client';

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

  // 정렬 옵션 설정
  private getOrderBy(sortBy: string) {
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
}
