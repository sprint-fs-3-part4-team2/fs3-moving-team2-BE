import { Request, Response } from 'express';
import ChatService from '../service/service';

const test1 = 'cm8o9235h0000iucytl5xyxlp';
const test2 = 'cm8o9235h0001iucy99xuiqzu';

class ChatController {
  constructor(private service: ChatService) {}
  chat = async (req: Request, res: Response) => {
    const chatRoom = await this.service.createRoom({ userId: [test1, test2] });
    console.log(chatRoom);
    res.status(201).json({
      message: 'test',
    });
  };
}

export default ChatController;
