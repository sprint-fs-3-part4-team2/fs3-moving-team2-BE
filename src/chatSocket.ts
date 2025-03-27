import { Server } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prismaClient from './prismaClient';

export default function ChatIo(io: Server) {
  io.on('connection', (socket) => {
    console.log('socket 연결', socket.id);

    socket.on('chatRoom', async ({ accessToken, targetId }, cb) => {
      console.log(accessToken);
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;
      const { userId, roleId, type } = decoded;
      const user = await prismaClient.user.findUnique({
        where: {
          id: userId,
        },
      });
    });

    socket.on('disconnect', () => {
      console.log('socket 연결 해제');
    });
  });
}
