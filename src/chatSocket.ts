import { Server, Namespace, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prismaClient from './prismaClient';
import { Request } from 'express';

export default function ChatIo(io: Server | Namespace) {
  const chatRoomInfo = new Map<string, any>();

  io.use((socket: Socket, next) => {
    // const token = socket.handshake.headers.cookie?.split('accessToken=')[1]?.split(';')[0];

    // if (!token) {
    //   console.log('🚫 No accessToken found');
    //   return next(new Error('Authentication error'));
    // }

    try {
      // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.data.user = {
        userId: 'cm8sdyggr0000iucf38yscg7x',
        roleId: 'cm8sdygja005iiucfkg91ihhh',
        type: 'mover',
      } as Request['user'];
      next();
    } catch (err: unknown) {
      console.error(err);
      console.log('🚫 인가되지 않은 toke');
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('chatRoom', async ({ targetId }, cb) => {
      console.log(new Date(), '채팅방 연결', socket.id);
      const user = socket.data.user;
      if (!user) return cb({ ok: false, mesasge: '접근 불가' });
      try {
        let chatRoom: any = await prismaClient.chatRoom.findFirst({
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
