import { Server, Namespace, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prismaClient from './prismaClient';
import { Request } from 'express';
import { ChatMessage, ChatRoomUser, ChatRoom } from '@prisma/client';

export type ChatRoomWithDetailsSelected = ChatRoom & {
  users: ChatRoomUser[];
  ChatMessage: Pick<ChatMessage, 'createdAt' | 'content' | 'userId'>[];
};

export default function ChatIo(io: Server | Namespace): void {
  const chatRoomInfo = new Map<string, ChatRoom>();

  io.use((socket: Socket, next) => {
    const token = socket.handshake.headers.cookie?.split('accessToken=')[1]?.split(';')[0];

    if (!token) {
      console.log('🚫 No accessToken');
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Request['user'];
      socket.data.user = {
        userId: decoded?.userId,
        roleId: decoded?.roleId,
        type: decoded?.type,
      } as Request['user'];
      next();
    } catch (err: unknown) {
      console.error(err);
      console.error('🚫 인가되지 않은 접근');
      next(new Error('Authentication Error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('chatRoom', async ({ targetId }, cb) => {
      console.log(new Date(), '채팅방 연결', socket.id);
      const user = socket.data.user;
      if (!user) {
        cb({ ok: false, mesasge: '🚫 접근 불가' });
        return;
      }

      try {
        let chatRoom: ChatRoomWithDetailsSelected | ChatRoom | null =
          await prismaClient.chatRoom.findFirst({
            where: {
              users: {
                some: {
                  userId: user.userId,
                  chatRoom: {
                    users: {
                      some: {
                        userId: targetId,
                      },
                    },
                  },
                },
              },
            },
            include: {
              users: true,
              ChatMessage: { select: { createdAt: true, content: true, userId: true } },
            },
          });

        if (!chatRoom) {
          chatRoom = await prismaClient.chatRoom.create({
            data: {
              users: {
                create: [
                  { user: { connect: { id: user.userId } } },
                  { user: { connect: { id: targetId } } },
                ],
              },
            },
          });
        }

        chatRoomInfo.set('chatRoom', chatRoom);
        cb({
          ok: true,
          exists: !!chatRoom,
          chatRoom,
        });
      } catch (err) {
        cb({ ok: false, error: err });
      }
    });

    socket.on('chatMsg', async ({ message }, cb) => {
      try {
        const chatRoom = chatRoomInfo.get('chatRoom');
        const user = socket.data.user;
        if (!chatRoom || !user) {
          cb({ ok: false, error: new Error('권한 없음') });
          return;
        }

        const insertMsg = await prismaClient.chatMessage.create({
          data: {
            chatRoomId: chatRoom.id,
            userId: user.userId,
            content: message,
          },
        });
        cb({ ok: true, message, msgId: insertMsg.id });
      } catch (err) {
        cb({ ok: false, error: err });
      }
    });

    socket.on('disconnect', () => {
      console.log(new Date(), 'socket 연결 해제');
    });
  });
}
