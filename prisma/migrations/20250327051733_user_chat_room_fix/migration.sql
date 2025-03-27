/*
  Warnings:

  - You are about to drop the `_UserChatRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserChatRoom" DROP CONSTRAINT "_UserChatRoom_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserChatRoom" DROP CONSTRAINT "_UserChatRoom_B_fkey";

-- DropTable
DROP TABLE "_UserChatRoom";
