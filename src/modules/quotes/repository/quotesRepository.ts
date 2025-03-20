import { PrismaClient } from '@prisma/client';

export default class QuotesRepository {
  constructor(private prismaClient: PrismaClient) {}

  private MOVER_INCLUDE_CLAUSE = {
    mover: {
      select: {
        user: {
          select: {
            name: true,
          },
        },
        experienceYears: true,
        profileImage: true,
        introduction: true,
        totalConfirmedCount: true,
        totalCustomerFavorite: true,
        totalReviews: true,
        averageRating: true,
      },
    },
  };

  private CUSTOMER_INCLUDE_CLAUSE = {
    customer: {
      select: {
        user: {
          select: {
            name: true,
          },
        },
      },
    },
  };

  async getQuoteForCustomer(quoteId: string) {
    return await this.prismaClient.moverQuote.findUnique({
      where: {
        id: quoteId,
      },
      include: {
        ...this.MOVER_INCLUDE_CLAUSE,
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

  async getQuoteForMover(quoteId: string) {
    return await this.prismaClient.moverQuote.findUnique({
      where: {
        id: quoteId,
      },
      include: {
        quoteMatch: {
          select: {
            id: true,
          },
        },
        quoteRequest: {
          include: {
            quoteRequestAddresses: true,
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
    });
  }
}
