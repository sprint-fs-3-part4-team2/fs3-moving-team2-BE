import { Region } from '@prisma/client';
export interface CustomerFind {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  profile_image: string;
  location: Region;
}
