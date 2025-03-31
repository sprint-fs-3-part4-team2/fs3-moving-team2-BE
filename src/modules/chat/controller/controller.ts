import { Request, Response } from 'express';
import ChatService from '../service/service';
import { AUTH_MESSAGES } from '@/constants/authMessages';

class ChatController {
  constructor(private service: ChatService) {}
  getRooms = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ ok: false, message: AUTH_MESSAGES.read });
      return;
    }
    const { userId } = req.user;
    const rooms = await this.service.getRooms(userId);
    if (!rooms) {
      res.status(404).json({ ok: false, message: ' 채팅방이 없습니다' });
    }
    res.status(200).json({ ok: true, rooms });
  };
}

export default ChatController;
