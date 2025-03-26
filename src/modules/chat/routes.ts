import { Router } from 'express';
import ChatController from './controller/controller';
import ChatService from './service/service';

const chat = Router();
const chatService = new ChatService();
const chatController = new ChatController(chatService);

chat.post('/', chatController.chat);

export default chat;
