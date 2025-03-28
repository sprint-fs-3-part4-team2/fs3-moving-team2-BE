import { Server, Namespace } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prismaClient from './prismaClient';
import { Request } from 'express';

export default function ChatIo(io: Server | Namespace) {
  io.on('connection', (socket) => {
    socket.on('chatRoom', async ({ accessToken, targetId }, cb) => {
      console.log(new Date(), '채팅방 연결', socket.id);
      const user = mapUser.get('user') || {
        userId: '',
        roleId: '',
        type: '',
      };
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
        }
        cb({
          ok: true,
          exists: !!chatRoom,
          chatRoom,
        });
      } catch (err) {
        cb({ ok: false, error: err });
      }
    });

    socket.on('chatMsgㄴ', async ({ test }, cb) => {});

    socket.on('disconnect', () => {
      console.log(new Date(), 'socket 연결 해제');
    });
  });
}

export const mapUser = new Map<string, Request['user']>();
