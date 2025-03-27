-- CreateTable
CREATE TABLE "user_chat_room" (
    "userId" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',

    CONSTRAINT "user_chat_room_pkey" PRIMARY KEY ("userId","chatRoomId")
);

-- AddForeignKey
ALTER TABLE "user_chat_room" ADD CONSTRAINT "user_chat_room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_chat_room" ADD CONSTRAINT "user_chat_room_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
