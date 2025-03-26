import prismaClient from '@/prismaClient';

const test2 = 'cm8o9235h0001iucy99xuiqzu';
class ChatService {
  constructor() {}
  async createRoom({ userId }: { userId: string }): Promise<any> {
    const result = { message: '' };
    try {
      const myChatingRoom = await prismaClient.chatRoom.findMany({
        where: {
          AND: [
            { user: { some: { id: userId } } }, // user1이 포함된 채팅방
            { user: { some: { id: test2 } } }, // user2도 포함된 채팅방
          ],
        },
      });
      console.log(myChatingRoom);
      if (myChatingRoom) {
        return result;
      }
      const createRoom = await prismaClient.chatRoom.create({
        data: {},
      });
      console.log(createRoom);
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
