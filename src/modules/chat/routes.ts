import { Router } from 'express';
import ChatController from './controller/controller';
import ChatService from './service/service';
import { PrismaClient } from '@prisma/client';

const chat = Router();
const chatService = new ChatService(new PrismaClient());
const chatController = new ChatController(chatService);

chat.get('/room', chatController.getRooms);

export default chat;
