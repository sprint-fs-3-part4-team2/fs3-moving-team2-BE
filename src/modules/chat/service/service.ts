import { Prisma, PrismaClient } from '@prisma/client';

class ChatService {
  constructor(private prisma: PrismaClient) {}
  public getRooms = async (userId: string) => {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          select: {
            joinedAt: true,
            role: true,
            userId: true,
            user: { select: { name: true, userType: true } },
          },
        },
        ChatMessage: {
          select: {
            id: true,
            content: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                userType: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
    return rooms.map((data) => {
      const { ChatMessage, createdAt, id, users } = data;
      const lastMessage = ChatMessage[0];
      const conversationPartner = users.filter((user) => user.userId !== userId);

      return {
        id,
        lastMessage,
        roomCreatedAt: createdAt,
        conversationPartner,
      };
    });
  };
}

export default ChatService;
