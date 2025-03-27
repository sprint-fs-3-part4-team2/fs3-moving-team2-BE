import prismaClient from '@/prismaClient';
import { Prisma } from '@prisma/client';

class ChatService {
  constructor() {}
  async createRoom({ userId }: { userId: string[] }): Promise<any> {
    const result = { message: '' };
    try {
      // const myChatingRoom = await prismaClient.chatRoom.findMany({
      //   where: {
      //     AND: userId.map((v): Prisma.ChatRoomWhereInput => {
      //       return { user: { some: { id: v } } };
      //     }),
      //   },
      // });
      // console.log(myChatingRoom);
      // if (myChatingRoom) {
      //   return result;
      // }
      // const createRoom = await prismaClient.chatRoom.create({
      //   data: {},
      // });
      // console.log(createRoom);
      return result;
    } catch (err: any) {
      console.error('createRoom');
      console.table(err);
      throw new Error(err);
    }
  }

  public async createMsg() {
    try {
      console.log('');
    } catch (err) {
      console.error('createMsg');
      console.table(err);
    }
  }
}

export default ChatService;
