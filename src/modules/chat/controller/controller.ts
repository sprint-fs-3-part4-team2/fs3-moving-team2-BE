import { Request, Response } from 'express';
import ChatService from '../service/service';

const test1 = 'cm8o9235h0000iucytl5xyxlp';
class ChatController {
  constructor(private service: ChatService) {}
  chat = async (req: Request, res: Response) => {
    const chatRoom = await this.service.createRoom({ userId: test1 });
    console.log(chatRoom);
    res.status(201).json({
      message: 'test',
    });
  };
}

export default ChatController;
