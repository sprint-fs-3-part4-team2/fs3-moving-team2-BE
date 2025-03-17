import { PrismaClient } from '@prisma/client';

export default class QuotesRepository {
  constructor(private prismaClient: PrismaClient) {}

  async getQuoteForCustomer(quoteId: string) {
    return await this.prismaClient.moverQuote.findUnique({
      where: {
        id: quoteId,
      },
      include: {
        mover: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
            experienceYears: true,
            profileImage: true,
            description: true,
            totalConfirmedCount: true,
            totalCustomerFavorite: true,
            totalReviews: true,
            averageRating: true,
          },
        },
        quoteMatch: {
          select: {
            id: true,
          },
        },
        quoteRequest: {
          include: {
            quoteRequestAddresses: true,
          },
        },
      },
    });
  }
}
