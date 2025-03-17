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
            experience_years: true,
            profile_image: true,
            description: true,
            total_confirmed_count: true,
            total_customer_favorite: true,
            total_reviews: true,
            average_rating: true,
          },
        },
        quote_match: {
          select: {
            id: true,
          },
        },
        quote_request: true,
      },
    });
  }
}
