import { Region } from '@prisma/client';
export interface CustomerFind {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  profileImage: string;
  location: Region;
}
