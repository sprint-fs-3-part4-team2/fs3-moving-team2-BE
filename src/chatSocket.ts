import { Server, Namespace } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prismaClient from './prismaClient';

export default function ChatIo(io: Server | Namespace) {
  io.on('connection', (socket) => {
    const user = socket.on('user', async (accessToken, cb) => {
      //   const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;
      //   const { userId, roleId, type } = decoded;
      const myId = accessToken;
      try {
        // return await prismaClient.user.findUnique({
        //   where: {
        //     id: myId,
        //   },
        //   select: {
        //     id: true,
        //   },
        // });
      } catch (err) {
        cb({ ok: false, error: err });
        // return null;
      }
    });

    socket.on('chatRoom', async ({ accessToken, targetId }, cb) => {
      console.log(new Date(), '채팅방 연결', socket.id);
      const myId = accessToken;
      if (!user) return cb({ ok: false, mesasge: '접근 불가' });

      try {
        let chatRoom = await prismaClient.chatRoom.findFirst({
          where: {
            users: {
              some: {
                userId: user.id,
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
            users: true, // 필요하면 유저 정보도 가져옴
          },
        });

        if (!chatRoom) {
          chatRoom = await prismaClient.chatRoom.create({
            data: {
              users: {
                create: [
                  { user: { connect: { id: myId } } },
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
