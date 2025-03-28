import { Server, Namespace } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prismaClient from './prismaClient';
import { Request } from 'express';

export default function ChatIo(io: Server | Namespace) {
  io.on('connection', (socket) => {
    socket.on('chatRoom', async ({ targetId }, cb) => {
      console.log(new Date(), '채팅방 연결', socket.id);
      const user = mapUser.get('user');

      if (!user) return cb({ ok: false, mesasge: '접근 불가' });
      try {
        let chatRoom = await prismaClient.chatRoom.findFirst({
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
            include: {
              users: true,
            },
          });
          console.log('채팅방 새성');
        }
        console.log('채팅방 있음');
        cb({
          ok: true,
          exists: !!chatRoom,
          chatRoom,
        });
      } catch (err) {
        cb({ ok: false, error: err });
      }
    });

    socket.on('chatMsg', async ({ test }, cb) => {
      try {
        cb({ ok: true });
      } catch (err) {
        cb({ ok: false, error: err });
      }
    });

    socket.on('disconnect', () => {
      console.log(new Date(), 'socket 연결 해제');
    });
  });
}

export const mapUser = new Map<string, Request['user']>();
